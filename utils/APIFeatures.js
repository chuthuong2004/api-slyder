export function APIFeatures(query, queryString) {
    this.query = query;
    this.queryString = queryString;

    this.paginating = () => {
        var page = this.queryString.page * 1 || 1;
        var limit = this.queryString.limit * 1 || 0;
        var skip = (page - 1) * limit;
        this.query = this.query.limit(limit).skip(skip);
        return this;
    };
    this.sorting = () => {
        var sort = this.queryString.sort || "-createdAt";
        this.query = this.query.sort(sort);
        return this;
    };

    this.searching = () => {
        var search = this.queryString.search;
        if (search) {
            this.query = this.query.find({
                $or: [
                    { name: { $regex: new RegExp(".*" + search + ".*", "i") } },
                    {
                        keywords: {
                            $regex: new RegExp(".*" + search + ".*", "i"),
                        },
                    },
                ],
            });
        } else {
            this.query = this.query.find();
        }
        return this;
    };
    this.filtering = () => {
        const queryObj = {...this.queryString };
        console.log(queryObj);
        const excludedField = ["page", "sort", "limit", "search"];
        excludedField.forEach((item) => delete queryObj[item]);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|gt|lt|lte|regex)\b/g,
            (match) => "$" + match
        );
        const newQuery = JSON.parse(queryStr);
        console.log(newQuery);
        this.query = this.query.find(newQuery);
        return this;
    };
}