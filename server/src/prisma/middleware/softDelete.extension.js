const SOFT_DELETE_MODELS = new Set([
  "Product",
  "ProductVariant",
  "Order",
  "User",
]);

export const softDeleteExtension = {
  name: "softDeleteFilter",

  query: {
    $allModels: {
      async findMany({ model, args, query }) {
        if (!SOFT_DELETE_MODELS.has(model)) {
          return query(args);
        }

        args.where = {
          ...(args.where || {}),
          deletedAt: null,
        };

        return query(args);
      },

      async findFirst({ model, args, query }) {
        if (!SOFT_DELETE_MODELS.has(model)) {
          return query(args);
        }

        args.where = {
          ...(args.where || {}),
          deletedAt: null,
        };

        return query(args);
      },

      async findUnique({ model, args, query }) {
        if (!SOFT_DELETE_MODELS.has(model)) {
          return query(args);
        }

        /**
         * findUnique does not allow extra filters,
         * so we transparently convert it to findFirst
         */
        return query({
          ...args,
          where: {
            ...args.where,
            deletedAt: null,
          },
        });
      },

      async count({ model, args, query }) {
        if (!SOFT_DELETE_MODELS.has(model)) {
          return query(args);
        }

        args.where = {
          ...(args.where || {}),
          deletedAt: null,
        };

        return query(args);
      },

      async aggregate({ model, args, query }) {
        if (!SOFT_DELETE_MODELS.has(model)) {
          return query(args);
        }

        args.where = {
          ...(args.where || {}),
          deletedAt: null,
        };

        return query(args);
      },
    },
  },
};