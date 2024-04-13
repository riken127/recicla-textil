function filterAndAssign(target, source) {
    for (let key in source) {
        if (target.hasOwnProperty(key)) {
            target[key] = source[key];
        }
    }
}

module.exports = {
    filterAndAssign
}