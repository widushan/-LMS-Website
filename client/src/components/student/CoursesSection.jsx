import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import CourseCard from './CourseCard';
import { AppContext } from '../../context/AppContext';

const CoursesSection = () => {

  const {allCourses} = useContext(AppContext);

  return (

    <div className='py-16 md:px-40 px-8'>

      <h2 className='text-3xl font-medium text-gray-800'>
        Smart Learning for Serious Growth</h2>
      <p className='text-sm md:text-base text-gray-500 mt-3'>
        Discover our top-rated courses across various categories. <br /> From coding and design to business and wellness, our courses are crafted to deliver results.
      </p>

      <div className='grid grid-cols-auto px-4 md:px-0 md:my-16 my-10 gap-4'>
        {allCourses.slice(0,4).map((course, index)=> <CourseCard course={course} key={index} />)}
      </div>

      <Link to={'/course-list'} onClick={()=> scrollTo(0,0)} className='text-gray-500 border border-gray-500/30 px-10 py-3 rounded'>
      Show all courses</Link>

    </div>

  )

}

export default CoursesSection