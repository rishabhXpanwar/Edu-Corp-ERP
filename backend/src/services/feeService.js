import Fee from '../models/Fee.js';
import User from '../models/User.js';

class FeeService {
  async createFee(feeData) {
    const fee = new Fee(feeData);
    await fee.save();
    return fee;
  }

  async getFees(schoolId, filters, pagination) {
    const query = { schoolId };
    if (filters.status) query.status = filters.status;
    if (filters.classId) query.classId = filters.classId;

    if (filters.studentId) {
      query.studentId = filters.studentId;
    } else if (filters.sectionId || filters.studentName || filters.admissionNumber) {
      const userQuery = { schoolId, role: 'student' };
      if (filters.sectionId) userQuery.sectionId = filters.sectionId;
      if (filters.admissionNumber) userQuery.admissionNumber = filters.admissionNumber;
      if (filters.studentName) {
        userQuery.$or = [
          { name: { $regex: filters.studentName, $options: 'i' } },
          { firstName: { $regex: filters.studentName, $options: 'i' } },
          { lastName: { $regex: filters.studentName, $options: 'i' } },
        ];
      }
      
      const matchingStudents = await User.find(userQuery).select('_id').lean();
      const studentIds = matchingStudents.map(s => s._id);
      
      if (studentIds.length > 0) {
        query.studentId = { $in: studentIds };
      } else {
        // Force an empty result if filters applied but no students match
        return {
          items: [],
          total: 0,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: 1,
        };
      }
    }

    const skip = (pagination.page - 1) * pagination.limit;
    
    const [items, total] = await Promise.all([
      Fee.find(query)
        .populate('studentId', 'firstName lastName admissionNumber')
        .populate('classId', 'name section')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      Fee.countDocuments(query),
    ]);

    return {
      items,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit) || 1,
    };
  }

  async getStudentFees(schoolId, studentId) {
    return Fee.find({ schoolId, studentId })
      .populate('classId', 'name section')
      .sort({ dueDate: 1 })
      .lean();
  }

  async getFeeById(schoolId, feeId) {
    return Fee.findOne({ _id: feeId, schoolId });
  }

  async markFeePaid(feeId, paymentMethod) {
    const updateObj = {
      status: 'paid',
      paidDate: new Date(),
    };
    if (paymentMethod) {
      updateObj.paymentMethod = paymentMethod;
    }

    return Fee.findByIdAndUpdate(
      feeId,
      updateObj,
      { new: true }
    );
  }

  async markFeeUnpaid(feeId) {
    return Fee.findByIdAndUpdate(
      feeId,
      {
        status: 'unpaid',
        $unset: { paymentMethod: 1, paidDate: 1 },
      },
      { new: true }
    );
  }
}

export default new FeeService();
