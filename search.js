let coursesData = [];
let searchIndex = null;

async function initializeSearch() {
  try {
    const response = await fetch('courses.json');
    const data = await response.json();
    
    coursesData = Object.values(data).map(course => ({
      id: course.courseID,
      name: course.name,
      desc: course.desc,
      department: course.department,
      units: course.units,
      prereqString: course.prereqString || 'None'
    }));
    
    searchIndex = lunr(function () {
      this.ref('id');
      this.field('id', { boost: 10 });
      this.field('name', { boost: 5 });
      this.field('department', { boost: 2 });
      this.field('desc');
      
      coursesData.forEach(course => {
        this.add(course);
      });
    });
    
    return true;
  } catch (error) {
    console.error('Error loading courses:', error);
    return false;
  }
}

function searchCourses(query) {
  if (!searchIndex || !query.trim()) {
    return [];
  }
  
  try {
    const results = searchIndex.search(query);
    
    return results.map(result => {
      const course = coursesData.find(c => c.id === result.ref);
      return {
        ...course,
        score: result.score
      };
    }).slice(0, 10);
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export { initializeSearch, searchCourses };
