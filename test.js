const generateRandomString = function(number) {
    return Math.random().toString(36).substr(2, 6);
};


console.log(generateRandomString(4567788964))