module.exports = {
    info: {
      tableName: "StrapiStripePayment",
      singularName: "strapi-stripe-payment", // kebab-case mandatory
      pluralName: "strapi-stripe-payments", // kebab-case mandatory
      displayName: "Payment",
      description: "Stripe Payment",
      kind: "collectionType",
    },
    options: {
      draftAndPublish: "false",
    },
    pluginOptions: {
      "content-manager": {
        visible: true,
      },
      "content-type-builder": {
        visible: true,
      },
    },
    attributes: {
      txnDate: {
        type: "datetime",
        required: false,
        configurable: false,
      },
      transactionId: {
        type: "string",
        maxLength: 2500,
        required: true,
        configurable: false,
        unique:true
      },
      isTxnSuccessful: {
        type: "boolean",
        default: false,
        configurable: false,
      },
      txnMessage: {
        type: "string",
        maxLength: 5000,
        configurable: false,
      },
      txnErrorMessage: {
        type: "string",
        maxLength: 250,
        configurable: false,
      },
      txnAmount: {
        type: "decimal",
        required: false,
        configurable: false,
      },
      customerName: {
        type: "string",
        required: true,
        configurable: false,
      },
      customerEmail: {
        type: "string",
        required: true,
        configurable: false,
      },
      stripeProduct: {
        type: "relation",
        relation: "manyToOne",
        target: "plugin::strapi-stripe.strapi-stripe-product",
        inversedBy: "stripePayment",
        configurable: false,
      },
      user: {
        type: "relation",
        relation: "oneToOne",
        target: "plugin::users-permissions.user"
      },
      job:{
        type: "relation",
        relation: "manyToOne",
        target: "api::job.job",
        inversedBy: "payments"
      },
      sponsoredPost:{
        type: "relation",
        relation: "manyToOne",
        target: "api::sponsored-post.sponsored-post",
        inversedBy: "payments"
      }
    },
  };