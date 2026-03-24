import transportService from '../../services/transportService.js';
import { auditWriter } from '../../utils/auditWriter.js';

export const createTransport = async (req, res, next) => {
  console.log('[CTRL] createTransport called');

  try {
    const { routeName, vehicleNumber, driverName, driverPhone, stops } = req.body;

    const transport = await transportService.createTransport(req.schoolId, {
      routeName,
      vehicleNumber,
      driverName,
      driverPhone,
      stops,
    });

    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'CREATE_TRANSPORT',
      targetModel: 'Transport',
      targetId: transport._id,
      metadata: { routeName, vehicleNumber },
    });

    res.status(201).json({
      success: true,
      message: 'Transport route created',
      data: { transport },
    });
  } catch (error) {
    next(error);
  }
};

export const getTransports = async (req, res, next) => {
  console.log('[CTRL] getTransports called');

  try {
    const transports = await transportService.getTransports(req.schoolId);

    res.status(200).json({
      success: true,
      message: 'Transport routes retrieved',
      data: { transports },
    });
  } catch (error) {
    next(error);
  }
};

export const getTransport = async (req, res, next) => {
  console.log('[CTRL] getTransport called');

  try {
    const { id } = req.params;

    const transport = await transportService.getTransport(req.schoolId, id);

    res.status(200).json({
      success: true,
      message: 'Transport route retrieved',
      data: { transport },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTransport = async (req, res, next) => {
  console.log('[CTRL] updateTransport called');

  try {
    const { id } = req.params;
    const updates = req.body;

    const transport = await transportService.updateTransport(req.schoolId, id, updates);

    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'UPDATE_TRANSPORT',
      targetModel: 'Transport',
      targetId: transport._id,
      metadata: { updatedFields: Object.keys(updates) },
    });

    res.status(200).json({
      success: true,
      message: 'Transport route updated',
      data: { transport },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTransport = async (req, res, next) => {
  console.log('[CTRL] deleteTransport called');

  try {
    const { id } = req.params;

    const transport = await transportService.deleteTransport(req.schoolId, id);

    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'DELETE_TRANSPORT',
      targetModel: 'Transport',
      targetId: id,
      metadata: { routeName: transport.routeName },
    });

    res.status(200).json({
      success: true,
      message: 'Transport route deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const assignStudent = async (req, res, next) => {
  console.log('[CTRL] assignStudent called');

  try {
    const { id } = req.params;
    const { studentId } = req.body;

    const transport = await transportService.assignStudent(req.schoolId, id, studentId);

    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'ASSIGN_STUDENT_TRANSPORT',
      targetModel: 'Transport',
      targetId: transport._id,
      metadata: { studentId },
    });

    res.status(200).json({
      success: true,
      message: 'Student assigned to route',
      data: { transport },
    });
  } catch (error) {
    next(error);
  }
};

export const unassignStudent = async (req, res, next) => {
  console.log('[CTRL] unassignStudent called');

  try {
    const { id } = req.params;
    const { studentId } = req.body;

    const transport = await transportService.unassignStudent(req.schoolId, id, studentId);

    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'UNASSIGN_STUDENT_TRANSPORT',
      targetModel: 'Transport',
      targetId: transport._id,
      metadata: { studentId },
    });

    res.status(200).json({
      success: true,
      message: 'Student unassigned from route',
      data: { transport },
    });
  } catch (error) {
    next(error);
  }
};
