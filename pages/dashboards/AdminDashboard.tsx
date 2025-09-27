
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCourseContext } from '../../context/CourseContext';
import { EnrollmentStatus, Role, UserStatus, ReviewStatus, User } from '../../types';
import Spinner from '../../components/Spinner';
import ConfirmationModal from '../../components/ConfirmationModal';


const AdminDashboard: React.FC = () => {
  const { user: adminUser, users, updateUserStatus, updateUserRole, deleteUser, register } = useAuth();
  const { enrollments, courses, updateEnrollmentStatus, students, reviews, updateReviewStatus, deleteReview } = useCourseContext();
  const [activeTab, setActiveTab] = useState('enrollments');
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>({});
  const [pfpErrors, setPfpErrors] = useState<Record<string, boolean>>({});


  // Filters for enrollment management
  const [enrollmentSearch, setEnrollmentSearch] = useState('');
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState('All');

  // Filters for user management
  const [userSearch, setUserSearch] = useState('');

  // Filters for review management
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('All');
  
  // State for Create User Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: Role.Student });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [modalError, setModalError] = useState('');

  // State for Confirmation Modal
  const [confirmationState, setConfirmationState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
    isConfirming: false,
    confirmText: 'Confirm',
    confirmingText: 'Confirming...',
    variant: 'danger' as 'danger' | 'default',
  });

  const openConfirmation = (props: Omit<typeof confirmationState, 'isOpen' | 'isConfirming'>) => {
    setConfirmationState({ ...confirmationState, isOpen: true, ...props });
  };

  const closeConfirmation = () => {
    if (confirmationState.isConfirming) return;
    setConfirmationState(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirmAction = async () => {
    setConfirmationState(prev => ({ ...prev, isConfirming: true }));
    try {
      await confirmationState.onConfirm();
    } catch (e) {
      console.error("Confirmation action failed", e);
      alert('The action failed to complete.');
    } finally {
      setConfirmationState({ // Reset state and close
          isOpen: false, isConfirming: false, title: '', message: '', onConfirm: async () => {}, 
          confirmText: 'Confirm', confirmingText: 'Confirming...', variant: 'danger' 
      });
    }
  };


  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(enrollment => {
      const student = students.find(s => s.id === enrollment.studentId);
      const course = courses.find(c => c.id === enrollment.courseId);
      if (!student || !course) return false;

      const matchesStatus = enrollmentStatusFilter === 'All' || enrollment.status === enrollmentStatusFilter;

      const matchesSearch = enrollmentSearch === '' ||
        student.name.toLowerCase().includes(enrollmentSearch.toLowerCase()) ||
        course.title.toLowerCase().includes(enrollmentSearch.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [enrollments, students, courses, enrollmentSearch, enrollmentStatusFilter]);
  
  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    return users.filter(user =>
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [users, userSearch]);
  
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const student = students.find(s => s.id === review.studentId);
      const course = courses.find(c => c.id === review.courseId);
      if (!student || !course) return false;

      const matchesStatus = reviewStatusFilter === 'All' || review.status === reviewStatusFilter;

      const matchesSearch = reviewSearch === '' ||
        student.name.toLowerCase().includes(reviewSearch.toLowerCase()) ||
        course.title.toLowerCase().includes(reviewSearch.toLowerCase()) ||
        review.comment.toLowerCase().includes(reviewSearch.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [reviews, students, courses, reviewSearch, reviewStatusFilter]);


  const handleEnrollmentStatusChange = async (enrollmentId: string, status: EnrollmentStatus) => {
    setUpdatingItems(prev => ({ ...prev, [enrollmentId]: true }));
    try {
      await updateEnrollmentStatus(enrollmentId, status);
    } catch (error) {
      console.error("Failed to update enrollment", error);
      alert("Failed to update enrollment status.");
    } finally {
       setUpdatingItems(prev => ({ ...prev, [enrollmentId]: false }));
    }
  };
  
  const handleReviewAction = async (action: 'approve' | 'reject' | 'delete', reviewId: string) => {
    setUpdatingItems(prev => ({ ...prev, [reviewId]: true }));
    try {
      if(action === 'delete') {
        await deleteReview(reviewId);
      } else {
        const newStatus = action === 'approve' ? ReviewStatus.Approved : ReviewStatus.Rejected;
        await updateReviewStatus(reviewId, newStatus);
      }
    } catch (error) {
      alert(`Failed to ${action} review.`);
    } finally {
      setUpdatingItems(prev => ({ ...prev, [reviewId]: false }));
    }
  };


  const handleDeleteUser = async (userId: string) => {
    if (userId === adminUser?.id) return;
    setUpdatingItems(prev => ({ ...prev, [userId]: true }));
    try {
      await deleteUser(userId);
    } catch (error) {
      console.error("Failed to delete user", error);
      alert("Failed to delete user.");
    } finally {
      setUpdatingItems(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };
  
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    if (!newUser.name || !newUser.email || !newUser.password) {
        setModalError('Please fill out all fields.');
        return;
    }
    setIsCreatingUser(true);
    try {
        await register(newUser.name, newUser.email, newUser.role, newUser.password);
        setIsModalOpen(false);
        setNewUser({ name: '', email: '', password: '', role: Role.Student });
    } catch (err: any) {
        setModalError(err.message || 'Failed to create user.');
    } finally {
        setIsCreatingUser(false);
    }
  };


  const handleRoleChange = async (userId: string, role: Role) => {
    setUpdatingItems(prev => ({ ...prev, [`role-${userId}`]: true }));
    try {
      await updateUserRole(userId, role);
    } catch(error) {
        alert('Failed to update user role.');
    } finally {
        setUpdatingItems(prev => ({ ...prev, [`role-${userId}`]: false }));
    }
  };
  
  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    setUpdatingItems(prev => ({ ...prev, [`status-${userId}`]: true }));
    try {
      await updateUserStatus(userId, newStatus);
    } catch(error) {
        alert('Failed to update user status.');
    } finally {
        setUpdatingItems(prev => ({ ...prev, [`status-${userId}`]: false }));
    }
  }
  
  const TABS = {
    enrollments: 'Enrollment Management',
    users: 'User Management',
    reviews: 'Review Management'
  };
  
  const getStatusBadge = (status: EnrollmentStatus | ReviewStatus | UserStatus) => {
    const baseClasses = "px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full";
    const colors: Record<string, string> = {
        [EnrollmentStatus.Approved]: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
        [EnrollmentStatus.Pending]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
        [EnrollmentStatus.Rejected]: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
        [UserStatus.Active]: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
        [UserStatus.Disabled]: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    };
    return <span className={`${baseClasses} ${colors[status]}`}>{status}</span>;
  };
  
  const StarRatingDisplay = ({ rating }: { rating: number }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        ))}
    </div>
);


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

      <div id="tabpanel-enrollments" role="tabpanel" tabIndex={0} aria-labelledby="tab-enrollments" hidden={activeTab !== 'enrollments'}>
        <div>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-dark dark:text-light">Manage Enrollments</h2>
            <div className="flex gap-4 flex-wrap sm:flex-nowrap w-full sm:w-auto">
              <div className="relative flex-grow">
                <label htmlFor="enrollment-search" className="sr-only">Search student or course</label>
                <input
                  type="text"
                  id="enrollment-search"
                  placeholder="Search student or course..."
                  value={enrollmentSearch}
                  onChange={(e) => setEnrollmentSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-white dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                {enrollmentSearch && (
                  <button 
                      type="button" 
                      onClick={() => setEnrollmentSearch('')} 
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      aria-label="Clear search"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                  </button>
                )}
              </div>
              <label htmlFor="enrollment-status-filter" className="sr-only">Filter by status</label>
              <select
                id="enrollment-status-filter"
                value={enrollmentStatusFilter}
                onChange={(e) => setEnrollmentStatusFilter(e.target.value)}
                className="w-full sm:w-48 appearance-none bg-white dark:bg-gray-700/80 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="All">All Statuses</option>
                <option value={EnrollmentStatus.Pending}>Pending</option>
                <option value={EnrollmentStatus.Approved}>Approved</option>
                <option value={EnrollmentStatus.Rejected}>Rejected</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full bg-white dark:bg-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student</th>
                  <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
                  <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th scope="col" className="py-3 px-6 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEnrollments.length > 0 ? filteredEnrollments.map(enrollment => {
                  const student = students.find(s => s.id === enrollment.studentId);
                  const course = courses.find(c => c.id === enrollment.courseId);
                  const isUpdating = updatingItems[enrollment.id];
                  return (
                    <tr key={enrollment.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${isUpdating ? 'opacity-50' : ''}`}>
                      <td className="py-4 px-6 whitespace-nowrap font-medium text-dark dark:text-light">{student?.name}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-gray-600 dark:text-gray-300">{course?.title}</td>
                      <td className="py-4 px-6 whitespace-nowrap">{getStatusBadge(enrollment.status)}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {enrollment.status === EnrollmentStatus.Pending ? (
                            <>
                              <button
                                onClick={() => handleEnrollmentStatusChange(enrollment.id, EnrollmentStatus.Approved)}
                                disabled={isUpdating}
                                className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900 disabled:opacity-50"
                                aria-label={`Approve enrollment for ${student?.name} in ${course?.title}`}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openConfirmation({
                                  title: 'Reject Enrollment',
                                  message: `Are you sure you want to reject the enrollment for "${student?.name}" in "${course?.title}"?`,
                                  confirmText: 'Reject',
                                  confirmingText: 'Rejecting...',
                                  onConfirm: () => handleEnrollmentStatusChange(enrollment.id, EnrollmentStatus.Rejected),
                                  variant: 'danger',
                                })}
                                disabled={isUpdating}
                                className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900 disabled:opacity-50"
                                aria-label={`Reject enrollment for ${student?.name} in ${course?.title}`}
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <>
                              <label htmlFor={`status-select-${enrollment.id}`} className="sr-only">Update status for {student?.name}'s enrollment in {course?.title}</label>
                              <select
                                id={`status-select-${enrollment.id}`}
                                value={enrollment.status}
                                onChange={(e) => {
                                  const newStatus = e.target.value as EnrollmentStatus;
                                  if (newStatus === EnrollmentStatus.Rejected) {
                                      openConfirmation({
                                        title: 'Reject Enrollment',
                                        message: `Are you sure you want to reject the enrollment for "${student?.name}" in "${course?.title}"?`,
                                        confirmText: 'Reject',
                                        confirmingText: 'Rejecting...',
                                        onConfirm: () => handleEnrollmentStatusChange(enrollment.id, newStatus),
                                        variant: 'danger',
                                      });
                                  } else {
                                      handleEnrollmentStatusChange(enrollment.id, newStatus);
                                  }
                                }}
                                disabled={isUpdating}
                                className="p-1 text-sm rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary disabled:opacity-70 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                              >
                                <option value={EnrollmentStatus.Pending}>Pending</option>
                                <option value={EnrollmentStatus.Approved}>Approved</option>
                                <option value={EnrollmentStatus.Rejected}>Rejected</option>
                              </select>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">No enrollments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div id="tabpanel-users" role="tabpanel" tabIndex={0} aria-labelledby="tab-users" hidden={activeTab !== 'users'}>
        <div>
           <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              <h2 className="text-xl font-semibold text-dark dark:text-light">All Users</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                    <label htmlFor="user-search" className="sr-only">Search users</label>
                    <input
                        type="text"
                        id="user-search"
                        placeholder="Search by name or email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 bg-white dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    {userSearch && (
                        <button 
                            type="button" 
                            onClick={() => setUserSearch('')} 
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            aria-label="Clear search"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
                  Create New User
                </button>
              </div>
            </div>
           <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full bg-white dark:bg-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                  <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bio</th>
                  <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                  <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th scope="col" className="py-3 px-6 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.length > 0 ? filteredUsers.map(user => {
                    const isUpdating = updatingItems[user.id] || updatingItems[`role-${user.id}`] || updatingItems[`status-${user.id}`];
                    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    const hasPfpError = pfpErrors[user.id];
                    return (
                    <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${user.status === UserStatus.Disabled ? 'bg-gray-100 dark:bg-gray-800/60 opacity-70' : ''} ${isUpdating ? 'opacity-50' : ''}`}>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {hasPfpError || !user.profilePicture ? (
                              <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                                {initials}
                              </div>
                            ) : (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.profilePicture}
                                alt={`${user.name}'s profile`}
                                onError={() => setPfpErrors(prev => ({ ...prev, [user.id]: true }))}
                              />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-dark dark:text-light">{user.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                        <p className="line-clamp-2">{user.bio || 'No bio provided.'}</p>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <label htmlFor={`role-select-${user.id}`} className="sr-only">Change role for {user.name}</label>
                        <select
                          id={`role-select-${user.id}`}
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                          disabled={user.id === adminUser?.id || isUpdating}
                          className="w-full p-1 text-sm rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary disabled:opacity-70 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                        >
                          <option value={Role.Student}>Student</option>
                          <option value={Role.Teacher}>Teacher</option>
                          <option value={Role.Admin}>Admin</option>
                        </select>
                      </td>
                       <td className="py-4 px-6 whitespace-nowrap">{getStatusBadge(user.status)}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            onClick={() => handleStatusChange(user.id, user.status === UserStatus.Active ? UserStatus.Disabled : UserStatus.Active)}
                            disabled={user.id === adminUser?.id || isUpdating}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label={user.status === UserStatus.Active ? `Disable user ${user.name}` : `Enable user ${user.name}`}
                          >
                            {user.status === UserStatus.Active ? (
                               <svg aria-hidden="true" className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                                 <path d="M17,7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7M17,15A3,3 0 0,1 14,12A3,3 0 0,1 17,9A3,3 0 0,1 20,12A3,3 0 0,1 17,15Z" />
                               </svg>
                            ) : (
                                <svg aria-hidden="true" className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M17,7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7M7,15A3,3 0 0,1 4,12A3,3 0 0,1 7,9A3,3 0 0,1 10,12A3,3 0 0,1 7,15Z" />
                                </svg>
                            )}
                          </button>
                          <button
                            onClick={() => openConfirmation({
                              title: 'Delete User',
                              message: `Are you sure you want to delete the user "${user.name}"? This action cannot be undone.`,
                              confirmText: 'Delete',
                              confirmingText: 'Deleting...',
                              onConfirm: () => handleDeleteUser(user.id),
                              variant: 'danger',
                            })}
                            disabled={user.id === adminUser?.id || isUpdating}
                            className="p-2 rounded-full hover:bg-red-100 text-red-500 hover:text-red-700 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label={`Delete user ${user.name}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                )}) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div id="tabpanel-reviews" role="tabpanel" tabIndex={0} aria-labelledby="tab-reviews" hidden={activeTab !== 'reviews'}>
         <div>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-dark dark:text-light">Manage Reviews</h2>
             <div className="flex gap-4 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                <div className="relative flex-grow">
                  <label htmlFor="review-search" className="sr-only">Search reviews</label>
                  <input
                    type="text"
                    id="review-search"
                    placeholder="Search by student, course, or comment..."
                    value={reviewSearch}
                    onChange={(e) => setReviewSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                </div>
                <label htmlFor="review-status-filter" className="sr-only">Filter by status</label>
                <select
                  id="review-status-filter"
                  value={reviewStatusFilter}
                  onChange={(e) => setReviewStatusFilter(e.target.value)}
                  className="w-full sm:w-48 appearance-none bg-white dark:bg-gray-700/80 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="All">All Statuses</option>
                  <option value={ReviewStatus.Pending}>Pending</option>
                  <option value={ReviewStatus.Approved}>Approved</option>
                  <option value={ReviewStatus.Rejected}>Rejected</option>
                </select>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full bg-white dark:bg-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student & Course</th>
                  <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Comment</th>
                  <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rating</th>
                   <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th scope="col" className="py-3 px-6 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredReviews.length > 0 ? filteredReviews.map(review => {
                  const student = students.find(s => s.id === review.studentId);
                  const course = courses.find(c => c.id === review.courseId);
                  const isUpdating = updatingItems[review.id];
                  return (
                    <tr key={review.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isUpdating ? 'opacity-50' : ''} ${review.status === ReviewStatus.Pending ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <p className="font-semibold text-dark dark:text-light">{student?.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{course?.title}</p>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">{review.comment}</td>
                      <td className="py-4 px-6 whitespace-nowrap"><StarRatingDisplay rating={review.rating}/></td>
                      <td className="py-4 px-6 whitespace-nowrap">{getStatusBadge(review.status)}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                           {review.status === ReviewStatus.Pending && (
                                <>
                                    <button onClick={() => handleReviewAction('approve', review.id)} disabled={isUpdating} className="p-1.5 rounded text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900">Approve</button>
                                    <button onClick={() => handleReviewAction('reject', review.id)} disabled={isUpdating} className="p-1.5 rounded text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">Reject</button>
                                </>
                           )}
                           <button 
                                onClick={() => openConfirmation({
                                    title: 'Delete Review',
                                    message: 'Are you sure you want to permanently delete this review?',
                                    confirmText: 'Delete',
                                    confirmingText: 'Deleting...',
                                    onConfirm: () => handleReviewAction('delete', review.id),
                                    variant: 'danger',
                                })} 
                                disabled={isUpdating} 
                                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-red-600" aria-label="Delete review"
                           >
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                           </button>
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">No reviews found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="create-user-title">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" role="document">
            <div className="flex justify-between items-center mb-4">
              <h2 id="create-user-title" className="text-lg font-bold text-dark dark:text-light">Create New User</h2>
              <button onClick={() => setIsModalOpen(false)} aria-label="Close dialog" className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">&times;</button>
            </div>
            {modalError && <p className="text-red-500 text-sm mb-4">{modalError}</p>}
            <form onSubmit={handleCreateUser} className="space-y-4">
               <div>
                 <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                 <input type="text" name="name" id="name" value={newUser.name} onChange={handleModalInputChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary" required />
               </div>
               <div>
                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                 <input type="email" name="email" id="email" value={newUser.email} onChange={handleModalInputChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary" required />
               </div>
               <div>
                 <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                 <input type="password" name="password" id="password" value={newUser.password} onChange={handleModalInputChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary" required />
               </div>
               <div>
                 <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                 <select name="role" id="role" value={newUser.role} onChange={handleModalInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                    <option value={Role.Student}>Student</option>
                    <option value={Role.Teacher}>Teacher</option>
                    <option value={Role.Admin}>Admin</option>
                 </select>
               </div>
               <div className="flex justify-end space-x-3 pt-4">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
                 <button type="submit" disabled={isCreatingUser} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-red-700 disabled:bg-red-400">
                    {isCreatingUser && <Spinner className="w-4 h-4 mr-2" />}
                    {isCreatingUser ? 'Creating...' : 'Create User'}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={closeConfirmation}
        onConfirm={handleConfirmAction}
        title={confirmationState.title}
        message={confirmationState.message}
        isConfirming={confirmationState.isConfirming}
        confirmText={confirmationState.confirmText}
        confirmingText={confirmationState.confirmingText}
        variant={confirmationState.variant}
      />
    </div>
  );
};

export default AdminDashboard;
