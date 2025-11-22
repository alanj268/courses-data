// Generated build script to pre-generate Lunr search index
// Run with: npm run build

import { createRequire } from 'module';
import fs from 'fs';

const require = createRequire(import.meta.url);
const lunr = require('lunr');

console.log('Building Lunr search index...');

// Read courses.json
const coursesData = JSON.parse(fs.readFileSync('./courses.json', 'utf8'));

// Convert MongoDB-style object to array
const documents = Object.values(coursesData).map(course => ({
  id: course.courseID,
  name: course.name,
  desc: course.desc,
  department: course.department,
  units: course.units,
  prereqString: course.prereqString || 'None'
}));

console.log(`Found ${documents.length} courses`);

// Build the Lunr index
const idx = lunr(function () {
  this.ref('id');
  this.field('id', { boost: 10 });
  this.field('name', { boost: 5 });
  this.field('department', { boost: 2 });
  this.field('desc');
  
  documents.forEach(function (doc) {
    this.add(doc);
  }, this);
});

// Serialize the index and documents
const serializedIndex = JSON.stringify(idx);
const serializedDocuments = JSON.stringify(documents);

// Write to files
fs.writeFileSync('./lunr-index.json', serializedIndex);
fs.writeFileSync('./courses-data.json', serializedDocuments);

console.log('Index built successfully!');
console.log(`   - lunr-index.json: ${(serializedIndex.length / 1024).toFixed(2)} KB`);
console.log(`   - courses-data.json: ${(serializedDocuments.length / 1024).toFixed(2)} KB`);

