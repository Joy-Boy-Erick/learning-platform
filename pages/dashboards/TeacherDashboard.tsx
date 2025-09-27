
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCourseContext } from '../../context/CourseContext';
import { CourseModule, Difficulty, EnrollmentStatus } from '../../types';
import { generateCourseContent } from '../../services/geminiService';
import Spinner from '../../components/Spinner';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { courses, enrollments, addCourse } = useCourseContext();
  const [activeTab, setActiveTab] = useState('myCourses');
  
  // Search state for My Courses
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Beginner);
  const [modules, setModules] = useState<{ id: string; title: string; content: string }[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // UI state
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!user) return null;

  const teacherCourses = useMemo(() => courses.filter(c => c.teacherId === user.id), [courses, user.id]);

  const filteredCourses = useMemo(() => {
    return teacherCourses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teacherCourses, searchTerm]);


  const TABS = {
    myCourses: 'My Courses',
    createCourse: 'Create New Course'
  };

  const handleGenerateContent = async () => {
    if (!title) {
      setError("Please enter a course title first.");
      return;
    }
    setError("");
    setIsGenerating(true);
    try {
      const content = await generateCourseContent(title);
      setDescription(content.description);
      if (content.modules && content.modules.length > 0) {
        setModules(content.modules.map((m, i) => ({ ...m, id: `mod-${Date.now()}-${i}` })));
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setDifficulty(Difficulty.Beginner);
    setModules([]);
    setThumbnail(null);
    setThumbnailPreview(null);
    setError('');
  };
  
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('File is too large. Please upload an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result as string);
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category) {
      setError("Please fill out all main course fields.");
      return;
    }
    if (modules.some(m => !m.title || !m.content)) {
      setError("Please fill out the title and content for all modules.");
      return;
    }
    setIsCreating(true);
    setError('');
    setSuccessMessage('');
    
    try {
        const finalModules: CourseModule[] = modules.map((mod, index) => ({
        id: `mod-final-${Date.now()}-${index}`,
        title: mod.title,
        content: mod.content
        }));

        const thumbnailUrl = thumbnail || `https://picsum.photos/seed/${title.replace(/\s+/g, '-')}/600/400`;

        await addCourse({
          title,
          description,
          category,
          teacherId: user.id,
          thumbnail: thumbnailUrl,
          modules: finalModules,
          difficulty,
        });
        
        setSuccessMessage('Course created successfully!');
        setTimeout(() => {
          resetForm();
          setSuccessMessage('');
          setActiveTab('myCourses');
        }, 2000);

    } catch(err) {
      setError("Failed to create the course. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // Module handlers
  const handleAddModule = () => {
    setModules([...modules, { id: `mod-${Date.now()}`, title: '', content: '' }]);
  };

  const handleModuleChange = (index: number, field: 'title' | 'content', value: string) => {
    const newModules = [...modules];
    newModules[index] = { ...newModules[index], [field]: value };
    setModules(newModules);
  };

  const handleDeleteModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };
  
  const moveModule = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= modules.length) return;
    const newModules = [...modules];
    const [movedItem] = newModules.splice(fromIndex, 1);
    newModules.splice(toIndex, 0, movedItem);
    setModules(newModules);
  };


  return (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/80">
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs" role="tablist">
          {Object.entries(TABS).map(([key, value]) => (
            <button
              key={key}
              id={`tab-${key}`}
              onClick={() => setActiveTab(key)}
              role="tab"
              aria-selected={activeTab === key}
              aria-controls={`tabpanel-${key}`}
              className={`${
                activeTab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'
              } whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm transition-colors`}
            >
              {value}
            </button>
          ))}
        </nav>
      </div>

      <div id="tabpanel-myCourses" role="tabpanel" tabIndex={0} aria-labelledby="tab-myCourses" hidden={activeTab !== 'myCourses'}>
        <div>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-dark dark:text-light">My Courses</h2>
            <div className="relative sm:w-72 w-full">
              <label htmlFor="search-my-courses" className="sr-only">Search my courses</label>
              <input
                type="text"
                id="search-my-courses"
                placeholder="Search my courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
          </div>
          {filteredCourses.length > 0 ? (
            <div className="space-y-4">
              {filteredCourses.map(course => (
                <a href={`#/courses/${course.id}`} key={course.id} className="block p-4 border dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-800 hover:border-primary/50 dark:hover:border-primary">
                  <h3 className="font-bold text-lg text-dark dark:text-light">{course.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{course.description}</p>
                   <p className="text-sm mt-2 font-semibold text-gray-800 dark:text-gray-200">Enrolled Students: {enrollments.filter(e => e.courseId === course.id && e.status === EnrollmentStatus.Approved).length}</p>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm ? `No courses found for "${searchTerm}".` : "You have not created any courses yet."}
            </p>
          )}
        </div>
      </div>

      <div id="tabpanel-createCourse" role="tabpanel" tabIndex={0} aria-labelledby="tab-createCourse" hidden={activeTab !== 'createCourse'}>
        <div>
          <h2 className="text-xl font-semibold mb-4 text-dark dark:text-light">Create a New Course</h2>
          <form onSubmit={handleCreateCourse} className="space-y-6">
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</p>}
             {successMessage && <p className="bg-green-100 text-green-700 p-3 rounded-md text-sm">{successMessage}</p>}
            
            <fieldset disabled={isGenerating || isCreating} className="space-y-6 transition-opacity duration-300 disabled:opacity-60 disabled:cursor-not-allowed">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Title</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="flex-grow block w-full px-4 py-2 bg-white dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    placeholder="e.g., Introduction to Quantum Physics"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateContent}
                    disabled={isGenerating || !title}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                  >
                    {isGenerating ? <Spinner className="w-5 h-5 mr-2" /> : (
                      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 110-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6h-1a1 1 0 010-2h1V3a1 1 0 011-1zM11 13a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span>{isGenerating ? 'Generating...' : 'Generate with AI'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Description</label>
                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={5} className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <input type="text" id="category" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
                  </div>
                  <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                  <select id="difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)} className="mt-1 block w-full px-4 py-2.5 bg-white dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none" required>
                      {Object.values(Difficulty).map(d => (
                      <option key={d} value={d}>{d}</option>
                      ))}
                  </select>
                  </div>
              </div>
              
              <div>
                <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Thumbnail</p>
                <div className="mt-1 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="Thumbnail preview" className="w-48 h-27 object-cover rounded-md shadow-sm" />
                  ) : (
                    <div className="w-48 h-27 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-400 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  <div className="flex-grow text-center sm:text-left">
                    <label htmlFor="thumbnail-upload" className="cursor-pointer w-full inline-flex justify-center bg-white dark:bg-gray-700/80 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                      <span>Upload an image</span>
                      <input id="thumbnail-upload" name="thumbnail" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleThumbnailChange} />
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Recommended size: 600x400. Max 2MB.</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">If no image is uploaded, a placeholder will be generated.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Modules</h3>
                <div className="space-y-4">
                  {modules.map((module, index) => (
                    <div
                      key={module.id}
                      className="p-4 border dark:border-gray-600 rounded-lg bg-gray-50/70 dark:bg-gray-700/50 relative transition-shadow hover:shadow-md"
                    >
                        <div className="flex-grow space-y-3">
                          <div>
                            <label htmlFor={`module-title-${index}`} className="block text-xs font-medium text-gray-600 dark:text-gray-400">Module {index + 1} Title</label>
                            <input type="text" id={`module-title-${index}`} value={module.title} onChange={(e) => handleModuleChange(index, 'title', e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm" placeholder="e.g., Introduction to..." required />
                          </div>
                          <div>
                            <label htmlFor={`module-content-${index}`} className="block text-xs font-medium text-gray-600 dark:text-gray-400">Module Content</label>
                            <textarea id={`module-content-${index}`} rows={3} value={module.content} onChange={(e) => handleModuleChange(index, 'content', e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm" placeholder="A brief summary of what this module covers." required />
                          </div>
                        </div>
                        <div className="absolute top-2.5 right-2.5 flex items-center space-x-1">
                           <button type="button" onClick={() => moveModule(index, index - 1)} disabled={index === 0} className="p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600" aria-label={`Move module ${index+1} up`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                           </button>
                           <button type="button" onClick={() => moveModule(index, index + 1)} disabled={index === modules.length - 1} className="p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600" aria-label={`Move module ${index+1} down`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                           </button>
                           <button type="button" onClick={() => handleDeleteModule(index)} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" aria-label={`Delete module ${index+1}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                           </button>
                        </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={handleAddModule} className="mt-4 inline-flex items-center px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  Add Module
                </button>
              </div>
            </fieldset>
            
            <button type="submit" disabled={isCreating || isGenerating || !!successMessage} className="w-full flex items-center justify-center bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105">
               {isCreating && <Spinner className="w-5 h-5 mr-2" />}
              {isCreating ? 'Creating...' : 'Create Course'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
