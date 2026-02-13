const testData = {
    validCredentials: {
        username: 'yedhu',
        password: 'yedhu@2001'
    },

    invalidCredentials: [
        { username: 'invalid', password: 'wrong', description: 'Invalid credentials' },
        { username: '', password: '', description: 'Empty fields' },
        { username: 'yedhu', password: 'wrong', description: 'Wrong password' }
    ],

    orderStatuses: ['open', 'closed', 'all'],

    districts: ['1', '2', '3'],

    scrapRegions: ['1', '2', '3'],

    dateTypes: ['schedule_date', 'created_date', 'completed_date'],

    dateRanges: [
        { start: '1', end: '10', description: 'First 10 days' },
        { start: '1', end: '20', description: 'First 20 days' },
        { start: '15', end: '28', description: 'Mid to end month' }
    ]
};

module.exports = { testData };
