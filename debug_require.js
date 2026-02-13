try {
    require('./tests/01-authentication.spec.js');
} catch (e) {
    console.log('MSG:' + e.message);
}
