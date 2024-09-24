export const sortResultAdvanceSearch = async (result: any, searchChars: string) => {
    let sort = result;
    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].shortDesc.length; j++) {
            if (result[i].shortDesc[j].val.toLowerCase().includes(searchChars.toLowerCase())) {
                sort = [result[i]].concat(sort);
            }
        }
    }
    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].metaDesc.length; j++) {
            if (result[i].metaDesc[j].val.toLowerCase().includes(searchChars.toLowerCase())) {
                sort = [result[i]].concat(sort);
            }
        }
    }
    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].metaTitle.length; j++) {
            if (result[i].metaTitle[j].val.toLowerCase().includes(searchChars.toLowerCase())) {
                sort = [result[i]].concat(sort);
            }
        }
    }
    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].metaKeywords.length; j++) {
            if (result[i].metaKeywords[j].val.toLowerCase().includes(searchChars.toLowerCase())) {
                sort = [result[i]].concat(sort);
            }
        }
    }
    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].name.length; j++) {
            if (result[i].name[j].val.toLowerCase().includes(searchChars.toLowerCase())) {
                sort = [result[i]].concat(sort);
            }
        }
    }

    async function uniq(sortResult: any[]) {
        return Array.from(new Set(sortResult));
    }

    let sortResult = await uniq(sort);

    return sortResult;
};

export const sortResultSearch = (result: any, searchChars: string) => {
    let sort = result;
    for (let x = 0; x < result.length; x++) {
        for (let i = 0; i < result[x].metaKeywords.length; i++) {
            if (result[x].metaKeywords[i].val.toLowerCase().includes(searchChars.toLowerCase())) {
                sort = [result[x]].concat(sort);
            }
        }
    }
    for (let x = 0; x < result.length; x++) {
        for (let i = 0; i < result[x].name.length; i++) {
            if (result[x].name[i].val.toLowerCase().includes(searchChars.toLowerCase())) {
                sort = [result[x]].concat(sort);
            }
        }
    }

    function uniq(sortResult: any[]) {
        return Array.from(new Set(sortResult));
    }

    let sortResult = uniq(sort);

    return sortResult;
};
