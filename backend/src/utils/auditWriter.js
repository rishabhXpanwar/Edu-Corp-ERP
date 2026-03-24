import AuditLog from '../models/AuditLog.js';

export const auditWriter = async ({
  actorId,
  actorRole,
  schoolId,
  action,
  targetModel,
  targetId,
  metadata = {}
}) => {
  try {
    const log = new AuditLog({
      actorId,
      actorRole,
      schoolId,
      action,
      targetModel,
      targetId,
      metadata
    });
    await log.save();
  } catch (err) {
    console.error('[AuditWriter] failed to write log:', err.message);
  }
};