function errorCode(error) {
  const name = String(error?.name || "NotificationError").replace(/[^A-Za-z0-9_-]/g, "");
  const code = String(error?.code || "delivery_failed").replace(/[^A-Za-z0-9_.-]/g, "");
  return `${name}:${code}`.slice(0, 160);
}

function backoffDelay(attempts, baseDelayMs, maxDelayMs) {
  return Math.min(maxDelayMs, baseDelayMs * 2 ** Math.max(0, attempts - 1));
}

export function createNotificationDispatcher({
  store,
  notifiers,
  logger,
  pollIntervalMs = 5_000,
  batchSize = 10,
  maxAttempts = 5,
  baseDelayMs = 30_000,
  maxDelayMs = 60 * 60 * 1_000,
  now = () => Date.now(),
}) {
  let timer = null;
  let running = null;
  let stopping = false;

  const logError = (details, message) => {
    if (typeof logger?.error === "function") logger.error(details, message);
  };

  async function dispatchPending() {
    if (running) return running;
    running = (async () => {
      const jobs = await store.claimNotificationJobs({ limit: batchSize });
      for (const job of jobs) {
        const targetKey = job.targetKey ?? job.target_key;
        const notifier = notifiers[job.channel];
        try {
          if (!notifier) {
            const missing = new Error("notification_channel_not_configured");
            missing.code = "channel_not_configured";
            throw missing;
          }
          const result = await notifier.send({
            id: job.id,
            targetKey,
            payload: job.payload,
          });
          await store.markNotificationSent({
            id: job.id,
            providerMessageId: result?.messageId || "",
          });
        } catch (error) {
          const attempts = Number(job.attempts || 1);
          const dead = attempts >= maxAttempts;
          await store.markNotificationFailed({
            id: job.id,
            error: errorCode(error),
            dead,
            nextAttemptAt: new Date(
              now() + backoffDelay(attempts, baseDelayMs, maxDelayMs),
            ),
          });
          logError(
            { notificationJobId: job.id, channel: job.channel, attempts, dead },
            "No se pudo entregar una notificación comercial.",
          );
        }
      }
      return jobs.length;
    })();

    try {
      return await running;
    } finally {
      running = null;
    }
  }

  function schedule() {
    if (stopping || timer) return;
    timer = setTimeout(async () => {
      timer = null;
      try {
        await dispatchPending();
      } catch (error) {
        logError({ error: errorCode(error) }, "Falló el ciclo de notificaciones comerciales.");
      }
      schedule();
    }, pollIntervalMs);
    timer.unref?.();
  }

  function start() {
    stopping = false;
    void dispatchPending().catch((error) => {
      logError({ error: errorCode(error) }, "Falló el inicio del dispatcher de notificaciones.");
    });
    schedule();
  }

  async function stop() {
    stopping = true;
    if (timer) clearTimeout(timer);
    timer = null;
    if (running) await running;
  }

  return { dispatchPending, start, stop };
}

export const dispatcherInternals = { backoffDelay, errorCode };
