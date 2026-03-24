import Transport from '../models/Transport.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

class TransportService {
  /**
   * Create a new transport route
   */
  async createTransport(schoolId, { routeName, vehicleNumber, driverName, driverPhone, stops }) {
    console.log('[Service] createTransport starting');

    const transport = await Transport.create({
      schoolId,
      routeName,
      vehicleNumber,
      driverName,
      driverPhone,
      stops: stops || [],
      assignedStudents: [],
    });

    console.log('[Service] createTransport completed — transportId:', transport._id);
    return transport;
  }

  /**
   * Get all transport routes for a school
   */
  async getTransports(schoolId) {
    console.log('[Service] getTransports starting');

    const transports = await Transport.find({ schoolId })
      .populate('assignedStudents', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    console.log('[Service] getTransports completed — found:', transports.length);
    return transports;
  }

  /**
   * Get a single transport route by id
   */
  async getTransport(schoolId, transportId) {
    console.log('[Service] getTransport starting — transportId:', transportId);

    const transport = await Transport.findOne({
      _id: transportId,
      schoolId,
    })
      .populate('assignedStudents', 'name email role')
      .lean();

    if (!transport) {
      throw new AppError('Transport route not found', 404);
    }

    console.log('[Service] getTransport completed');
    return transport;
  }

  /**
   * Update a transport route
   */
  async updateTransport(schoolId, transportId, updates) {
    console.log('[Service] updateTransport starting — transportId:', transportId);

    const transport = await Transport.findOne({
      _id: transportId,
      schoolId,
    });

    if (!transport) {
      throw new AppError('Transport route not found', 404);
    }

    // Allowed fields to update
    const allowedFields = ['routeName', 'vehicleNumber', 'driverName', 'driverPhone', 'stops'];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        transport[field] = updates[field];
      }
    }

    await transport.save();
    await transport.populate('assignedStudents', 'name email role');

    console.log('[Service] updateTransport completed');
    return transport;
  }

  /**
   * Delete a transport route
   */
  async deleteTransport(schoolId, transportId) {
    console.log('[Service] deleteTransport starting — transportId:', transportId);

    const transport = await Transport.findOneAndDelete({
      _id: transportId,
      schoolId,
    });

    if (!transport) {
      throw new AppError('Transport route not found', 404);
    }

    console.log('[Service] deleteTransport completed');
    return transport;
  }

  /**
   * Assign a student to a transport route
   */
  async assignStudent(schoolId, transportId, studentId) {
    console.log('[Service] assignStudent starting — transportId:', transportId, 'studentId:', studentId);

    const transport = await Transport.findOne({
      _id: transportId,
      schoolId,
    });

    if (!transport) {
      throw new AppError('Transport route not found', 404);
    }

    // Verify the student exists and belongs to the school
    const student = await User.findOne({
      _id: studentId,
      schoolId,
      role: 'student',
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    // Check if student is already assigned to this route
    const alreadyAssigned = transport.assignedStudents.some(
      (id) => id.toString() === studentId.toString()
    );

    if (alreadyAssigned) {
      throw new AppError('Student is already assigned to this route', 400);
    }

    // Check if student is assigned to another route in this school
    const existingAssignment = await Transport.findOne({
      schoolId,
      assignedStudents: studentId,
    });

    if (existingAssignment) {
      throw new AppError('Student is already assigned to another route', 400);
    }

    transport.assignedStudents.push(studentId);
    await transport.save();
    await transport.populate('assignedStudents', 'name email role');

    console.log('[Service] assignStudent completed');
    return transport;
  }

  /**
   * Unassign a student from a transport route
   */
  async unassignStudent(schoolId, transportId, studentId) {
    console.log('[Service] unassignStudent starting — transportId:', transportId, 'studentId:', studentId);

    const transport = await Transport.findOne({
      _id: transportId,
      schoolId,
    });

    if (!transport) {
      throw new AppError('Transport route not found', 404);
    }

    // Check if student is assigned to this route
    const studentIndex = transport.assignedStudents.findIndex(
      (id) => id.toString() === studentId.toString()
    );

    if (studentIndex === -1) {
      throw new AppError('Student is not assigned to this route', 400);
    }

    transport.assignedStudents.splice(studentIndex, 1);
    await transport.save();
    await transport.populate('assignedStudents', 'name email role');

    console.log('[Service] unassignStudent completed');
    return transport;
  }
}

export default new TransportService();
