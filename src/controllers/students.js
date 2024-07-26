import { 
    getAllStudents,
    getStudentById,
    createStudent,
    deleteStudent,
    upsertStudent,
} from '../services/students.js';
import createHttpError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { env } from '../utils/env.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

export const getAllStudentsController =  async (req, res) => {
    const { page, perPage } = parsePaginationParams(req.query);

    const { sortBy, sortOrder } = parseSortParams(req.query);
  
    const students = await getAllStudents({
      page,
      perPage,
      sortOrder,
      sortBy,
    });
  
    res.json({
      status: 200,
      message: 'Successfully found students!',
      data: students,
    });
};

export const getStudentByIdController = async (req, res) => {
    const { studentId } = req.params;
    const student = await getStudentById(studentId);

    if (!student) {
        next(createHttpError(404, 'Student not found'));
        return;
    }

    res.status(200).json({
        data: student,
    })
}

export const createStudentController = async (req, res) => {
    const photo = req.file;
    /* в photo лежить обʼєкт файлу
		{
		  fieldname: 'photo',
		  originalname: 'download.jpeg',
		  encoding: '7bit',
		  mimetype: 'image/jpeg',
		  destination: '/Users/borysmeshkov/Projects/goit-study/students-app/temp',
		  filename: '1710709919677_download.jpeg',
		  path: '/Users/borysmeshkov/Projects/goit-study/students-app/temp/1710709919677_download.jpeg',
		  size: 7
	  }
	*/
    let photoUrl;

    if(photo){
        if(env('ENABLE_CLOUDINARY') === 'true') {
            photoUrl = await saveFileToCloudinary(photo)
        } else {
            photoUrl = await saveFileToUploadDir(photo)
        }
    }

    const student = await createStudent({
        ...req.body,
        photo: photoUrl,});

    res.status(201).json({
        status: 201,
        message: `Successfully created a student!`,
        data: student,
    });
};

export const deleteStudentController = async (req, res, next) => {
    const { studentId } = req.params;
    const student = await deleteStudent(studentId);

    if (!student) {
        next(createHttpError(404, 'Student not found'));
        return;
    }
    
    res.status(204).send();
}

export const upsertStudentController = async (req, res, next) => {
    const { studentId } = req.params;
    const photo = req.file;

    let photoUrl;

    if(photo){

        if(env('ENABLE_CLOUDINARY') === 'true') {
            photoUrl = await saveFileToCloudinary(photo)
        } else {
            photoUrl = await saveFileToUploadDir(photo)
        }
    }

    const result = await upsertStudent(studentId, {
        ...req.body,
        photo: photoUrl,
    }, {
        upsert: true,
    });

    if (!result) {
    next(createHttpError(404, 'Student not found'));
    return;
    };

    const status = result.isNew ? 201 : 200;

    res.status(status).json({
        status,
        message: `Successfully upsert a student!`,
        data: result.student,
    });
};

export const patchStudentController = async (req, res) => {
    const { studentId } = req.params;
    const photo = req.file;

    let photoUrl;

    if(photo){
        if(Boolean(env('ENABLE_CLOUDINARY')) === true) {
            photoUrl = await saveFileToCloudinary(photo)
        } else {
            photoUrl = await saveFileToUploadDir(photo)
        }
    }

    const result = await upsertStudent(studentId, {
        ...req.body,
        photo: photoUrl,
    });
  
    if (!result) {
      next(createHttpError(404, 'Student not found'));
      return;
    }
  
    res.json({
      status: 200,
      message: `Successfully patched a student!`,
      data: result.student,
    });
};