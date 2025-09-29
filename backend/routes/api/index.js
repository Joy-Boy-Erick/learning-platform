import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import {
  getUsers,
  updateUser,
  deleteUser,
  getCourses,
  addCourse,
  updateCourse,
  getEnrollments,
  addEnrollment,
  updateEnrollment,
  getReviews,
  addReview,
  updateReview,
  deleteReview,
  login,
  register,
  getSessionUser,
  logout,
  addModuleToCourse,
  updateModuleInCourse,
  deleteModuleFromCourse,
  updateCourseModules
} from '../../data/store.js';

const router = express.Router();

// --- Health Check ---
router.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// --- Gemini AI Route ---
router.post('/generate-course', async (req, res, next) => {
  const { title } = req.body;
  if (!process.env.API_KEY) {
    return res.status(500).json({ message: 'AI features are not configured on the server.' });
  }
  if (!title) {
    return res.status(400).json({ message: 'Course title is required.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a course outline for a course titled "${title}". The output should be a JSON object with two properties: "description" (a string of 2-3 sentences) and "modules" (an array of objects, where each object has a "title" and a "content" property). Generate 3-5 modules.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                },
                required: ["title", "content"],
              },
            },
          },
          required: ["description", "modules"],
        },
      },
    });
    const jsonText = response.text.trim();
    res.json(JSON.parse(jsonText));
  } catch (error) {
    console.error("Error in /generate-course:", error);
    next(new Error("Failed to generate course content with AI."));
  }
});

// --- Auth Routes ---
router.post('/auth/login', (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = login(email, password);
    res.json(user);
  } catch(error) {
    next(error);
  }
});
router.post('/auth/logout', (req, res, next) => {
  try {
    logout();
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});
router.get('/auth/session', (req, res, next) => {
  try {
    const user = getSessionUser();
    res.json({ user });
  } catch (error) {
    next(error);
  }
});
router.post('/auth/register', (req, res, next) => {
  try {
    const { name, email, role, password } = req.body;
    const newUser = register(name, email, role, password);
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

// --- User Routes ---
router.get('/users', (req, res) => res.json(getUsers()));
router.put('/users/:id', (req, res, next) => {
  try {
    const updatedUser = updateUser(req.body);
    res.json(updatedUser);
  } catch(error) {
    next(error);
  }
});
router.delete('/users/:id', (req, res, next) => {
  try {
    const id = deleteUser(req.params.id);
    res.json({ id });
  } catch(error) {
    next(error);
  }
});

// --- Course Routes ---
router.get('/courses', (req, res) => res.json(getCourses()));
router.post('/courses', (req, res, next) => {
  try {
    const newCourse = addCourse(req.body);
    res.status(201).json(newCourse);
  } catch(error) {
    next(error);
  }
});
router.put('/courses/:id', (req, res, next) => {
  try {
    const updated = updateCourse(req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// --- Module Routes ---

// Reorder or batch-update all modules for a course
router.put('/courses/:courseId/modules', (req, res, next) => {
  try {
    const { courseId } = req.params;
    const modules = req.body; // Expects an array of module objects
    const updatedCourse = updateCourseModules(courseId, modules);
    res.json(updatedCourse.modules);
  } catch(error) {
    next(error);
  }
});

// Add a new module to a course
router.post('/courses/:courseId/modules', (req, res, next) => {
  try {
    const { courseId } = req.params;
    const moduleData = req.body;
    const newModule = addModuleToCourse(courseId, moduleData);
    res.status(201).json(newModule);
  } catch(error) {
    next(error);
  }
});

// Update a specific module
router.put('/courses/:courseId/modules/:moduleId', (req, res, next) => {
  try {
    const { courseId, moduleId } = req.params;
    const moduleData = req.body;
    const updatedModule = updateModuleInCourse(courseId, moduleId, moduleData);
    res.json(updatedModule);
  } catch(error) {
    next(error);
  }
});

// Delete a specific module
router.delete('/courses/:courseId/modules/:moduleId', (req, res, next) => {
  try {
    const { courseId, moduleId } = req.params;
    const result = deleteModuleFromCourse(courseId, moduleId);
    res.json(result);
  } catch(error) {
    next(error);
  }
});

// --- Enrollment Routes ---
router.get('/enrollments', (req, res) => res.json(getEnrollments()));
router.post('/enrollments', (req, res, next) => {
  try {
    const { courseId, studentId } = req.body;
    const newEnrollment = addEnrollment(courseId, studentId);
    res.status(201).json(newEnrollment);
  } catch (error) {
    next(error);
  }
});
router.patch('/enrollments/:id', (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = updateEnrollment(req.params.id, status);
    res.json(updated);
  } catch(error) {
    next(error);
  }
});


// --- Review Routes ---
router.get('/reviews', (req, res) => res.json(getReviews()));
router.post('/reviews', (req, res, next) => {
  try {
    const newReview = addReview(req.body);
    res.status(201).json(newReview);
  } catch(error) {
    next(error);
  }
});
router.patch('/reviews/:id', (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = updateReview(req.params.id, status);
    res.json(updated);
  } catch(error) {
    next(error);
  }
});
router.delete('/reviews/:id', (req, res, next) => {
  try {
    const id = deleteReview(req.params.id);
    res.json({ id });
  } catch (error) {
    next(error);
  }
});

export default router;