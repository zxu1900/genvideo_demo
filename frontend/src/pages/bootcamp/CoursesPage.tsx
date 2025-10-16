import React from 'react';
import { mockCourses } from '../../utils/mockData';
import { Clock, BarChart } from 'lucide-react';

const CoursesPage: React.FC = () => {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Courses</h1>
        <div className="grid md:grid-cols-3 gap-8">
          {mockCourses.map((course) => (
            <div key={course.id} className="card">
              <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover rounded-lg mb-4" />
              <h3 className="font-bold text-lg mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{course.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.duration}</span>
                <span className="flex items-center gap-1"><BarChart className="w-4 h-4" /> {course.difficulty}</span>
              </div>
              {course.enrolled ? (
                <div className="mb-4">
                  <div className="bg-gray-200 rounded-full h-2 mb-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${course.progress}%` }} />
                  </div>
                  <span className="text-sm text-gray-600">{course.progress}% Complete</span>
                </div>
              ) : null}
              <button className={course.enrolled ? 'btn-primary w-full' : 'btn-secondary w-full'}>
                {course.enrolled ? 'Continue' : 'Enroll'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
