export const pagination = (page, limit, model) => {
    var item = []
    if (limit) {
        if (!page) page = 1
        page = parseInt(page)
        limit = parseInt(limit)
        var skip = (page - 1) * limit
        model.find({}).skip(skip).limit(limit).then((data) => {
                console.log(data);
                item = data
            })
            .catch((err) => {
                console.log(err);
            })
    } else {
        // get all
        model.find().then((data) => { item = data }).catch((err) => { console.log(err); });
    }
    console.log(item);
    return item
}