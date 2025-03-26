const express = require('express');
const router = express.Router();

// Sửa từ '/userprofile' thành '/'
router.get('/', (req, res) => {
    res.render('me', {
        // Dữ liệu động sẽ được truyền vào đây sau
    });
});

module.exports = router;