/* eslint-disable implicit-arrow-linebreak */
const _ = require('lodash');
const { ObjectId } = require('mongodb');
const AppError = require('./errors/AppError');
const APIFeatures = require('./apiFeatures');

const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

exports.validateQuery = (paramName) =>
  catchAsync(async (req, res, next) => {
    if (!req.query[paramName]) {
      return next(new AppError(`Missing query parameter ${paramName}`, 400));
    }
    return next();
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No doc found with that ID', 404));
    }

    return res.status(204).json({
      success: true,
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No doc found with that ID', 404));
    }

    return res.status(200).json({
      success: true,
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model, additionalFields = {}) =>
  catchAsync(async (req, res, next) => {
    const newdoc = await Model.create(
      _.assign(
        req.body,
        _.reduce(
          additionalFields,
          (r, v, k) => {
            // eslint-disable-next-line no-param-reassign
            r[k] = _.get(req, v, null);
            return r;
          },
          {},
        ),
      ),
    );

    res.status(201).json({
      success: true,
      data: {
        doc: newdoc,
      },
    });
  });

exports.getOne = (Model, options = {}) =>
  catchAsync(async (req, res, next) => {
    let query;
    const filterOptions = options.filter
      ? _.reduce(
          options.filter,
          (r, v, k) => {
            // specificFilterOptions - will be used as is
            if (k === 'specificFilterOptions') {
              // eslint-disable-next-line no-param-reassign
              r = _.assign(r, _.get(req, v, {}));
            } else {
              // eslint-disable-next-line no-param-reassign
              r[k] = _.get(req, v, v);
            }

            return r;
          },
          {},
        )
      : { _id: ObjectId(req.params.id) };
    const projection = options.projection || {};

    if (options.populateOptions) {
      query = Model.findOne(filterOptions, projection).populate(
        options.populateOptions,
      );
    } else {
      query = Model.findOne(filterOptions, projection);
    }
    const doc = await query;

    if (!doc) {
      return next(new AppError('No doc found with that ID', 404));
    }

    return res.status(200).json({
      success: true,
      data: {
        doc,
      },
    });
  });

exports.getAll = (Model, options = {}) =>
  catchAsync(async (req, res, next) => {
    const filterOptions = options.filter
      ? _.reduce(
          options.filter,
          (r, v, k) => {
            // eslint-disable-next-line no-param-reassign
            r[k] = _.get(req, v, v);
            return r;
          },
          {},
        )
      : undefined;
    let features;

    if (options.populateOptions) {
      features = new APIFeatures(
        Model.find().populate(options.populateOptions),
        req.query,
      )
        .filter(filterOptions, options.populateOptions)
        .sort(options.hardcodedSorting ? options.hardcodedSorting : undefined)
        .limitFields(
          options.hardcodedProjection ? options.hardcodedProjection : undefined,
        )
        .paginate();
    } else {
      features = new APIFeatures(Model.find(), req.query)
        .filter(filterOptions)
        .sort(options.hardcodedSorting ? options.hardcodedSorting : undefined)
        .limitFields(
          options.hardcodedProjection ? options.hardcodedProjection : undefined,
        )
        .paginate();
    }

    let doc = await features.query.find();
    if (!doc || doc.length < 1) {
      return next(new AppError('No doc found', 404));
    }

    if (options.dataTransform) {
      doc = await options.dataTransform.func(
        doc,
        ..._.map(_.get(options, 'dataTransform.parameters', []), (v) =>
          _.get(req, v, v),
        ),
      );
    }

    // SEND RESPONSE
    return res.status(200).json({
      success: true,
      results: doc.length,
      data: {
        doc,
      },
    });
  });
