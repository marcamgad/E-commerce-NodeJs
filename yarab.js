const fs = require('fs');
const csv = require('csv-parser');

// Define function to read CSV file
function readCSV(filename) {
    return new Promise((resolve, reject) => {
        const data = [];
        fs.createReadStream(filename)
            .pipe(csv())
            .on('data', (row) => {
                data.push(row);
            })
            .on('end', () => {
                resolve(data);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

// Define function to divide data into groups
function divideDataBySchool(data) {
    const groups = {};
    data.forEach(student => {
        const school = student.school;
        if (!groups[school]) {
            groups[school] = [];
        }
        groups[school].push(student);
    });
    return groups;
}

// Define function to create groups of 7-10 students from each school
function createGroups(groups) {
    const result = [];
    for (const school in groups) {
        const students = groups[school];
        let group = [];
        let count = 0;
        while (students.length > 0) {
            const student = students.splice(Math.floor(Math.random() * students.length), 1)[0];
            if (!group.find(s => s.id === student.id)) {
                group.push(student);
                count++;
            }
            if (count >= 7 && count <= 10) {
                result.push(group);
                group = [];
                count = 0;
            }
        }
    }
    return result;
}

// Example usage
async function main() {
    try {
        const filename ="hi";
        const data = await readCSV(filename);
        const groupsBySchool = divideDataBySchool(data);
        const groups = createGroups(groupsBySchool);
        console.log(groups);
        // You can save the groups to a file here
    } catch (error) {
        console.error('Error:', error);
    }
}

// Call main function
main();



