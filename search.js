let coursesData = [];
let searchIndex = null;

async function initializeSearch() {
  try {
    const [indexResponse, dataResponse] = await Promise.all([
      fetch('lunr-index.json'),
      fetch('courses-data.json')
    ]);
    
    const serializedIndex = await indexResponse.json();
    coursesData = await dataResponse.json();
    
    searchIndex = lunr.Index.load(serializedIndex);
    
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
