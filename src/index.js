// region Imports
const fs = require('fs');
// endregion

// region Utility functions
const stringify = function stringify(object) {
    return JSON.stringify(object, null, 4);
};

const kebabify = function kebabify(camel) {
    return camel.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};
// endregion

export default async function (docs, whitelist) {
    // region Local declarations
    const customAttributes = {};
    const customTags = {};
    // endregion

    // region Converting objects to Vetur's expected format
    // region Converting common attributes
    Object.keys(whitelist).forEach((attribute) => {
        customAttributes[kebabify(attribute)] = whitelist[attribute];
    });
    // endregion

    // region Converting tags
    Object.keys(docs).forEach((tag) => {
        // region Tag-related info - part 1/2
        const kebabTag = kebabify(tag);
        const listOfAttributes = [];
        customTags[kebabTag] = {};
        customTags[kebabTag].description = docs[tag].description;
        // endregion

        // region Tag-specific attributes
        if (docs[tag].attributes) {
            Object.keys(docs[tag].attributes).forEach((attribute) => {
                const kebabAttribute = kebabify(attribute);
                listOfAttributes.push(kebabAttribute);
                if (!(attribute in whitelist)) {
                    customAttributes[`${kebabTag}/${kebabAttribute}`] = docs[tag].attributes[attribute];
                }
            });
        }
        // endregion

        // region Tag-related info - part 2/2
        if (listOfAttributes.length > 0) {
            customTags[kebabTag].attributes = listOfAttributes;
        }
        // endregion
    });
    // endregion
    // endregion

    // region Handling I/O
    if (!fs.existsSync('dist')) {
        fs.mkdirSync('dist');
    }
    await fs.writeFile('dist/attributes.json', stringify(customAttributes), (err) => {
        if (err) throw err;
    });
    await fs.writeFile('dist/tags.json', stringify(customTags), (err) => {
        if (err) throw err;
    });
    // endregion
}
