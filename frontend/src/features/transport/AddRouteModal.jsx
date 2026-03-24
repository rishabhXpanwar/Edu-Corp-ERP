import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../../components/Modal.jsx';
import { createRouteSchema, updateRouteSchema } from './transportSchemas.js';
import { createTransport, updateTransport, clearTransportError } from './transportSlice.js';
import './AddRouteModal.css';

const EMPTY_STOP = {
  stopName: '',
  pickUpTime: '',
  dropTime: '',
  feeAmount: '',
};

const buildPayload = (data) => {
  const stops = (data.stops || [])
    .map((stop) => {
      const parsedFee = Number(stop.feeAmount);
      const normalizedStop = {
        stopName: (stop.stopName || '').trim(),
      };

      if (stop.pickUpTime) {
        normalizedStop.pickUpTime = stop.pickUpTime;
      }

      if (stop.dropTime) {
        normalizedStop.dropTime = stop.dropTime;
      }

      if (stop.feeAmount !== '' && !Number.isNaN(parsedFee)) {
        normalizedStop.feeAmount = parsedFee;
      }

      return normalizedStop;
    })
    .filter((stop) => stop.stopName.length > 0);

  return {
    routeName: data.routeName.trim(),
    vehicleNumber: data.vehicleNumber.trim(),
    driverName: data.driverName.trim(),
    driverPhone: data.driverPhone.trim(),
    stops,
  };
};

const AddRouteModal = ({ isOpen, onClose, editingRoute }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.transport);

  const isEditMode = Boolean(editingRoute);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isEditMode ? updateRouteSchema : createRouteSchema),
    defaultValues: {
      routeName: '',
      vehicleNumber: '',
      driverName: '',
      driverPhone: '',
      stops: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'stops',
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    dispatch(clearTransportError());

    if (editingRoute) {
      reset({
        routeName: editingRoute.routeName || '',
        vehicleNumber: editingRoute.vehicleNumber || '',
        driverName: editingRoute.driverName || '',
        driverPhone: editingRoute.driverPhone || '',
        stops: editingRoute.stops?.length
          ? editingRoute.stops.map((stop) => ({
            stopName: stop.stopName || '',
            pickUpTime: stop.pickUpTime || '',
            dropTime: stop.dropTime || '',
            feeAmount: stop.feeAmount ?? '',
          }))
          : [],
      });
      return;
    }

    reset({
      routeName: '',
      vehicleNumber: '',
      driverName: '',
      driverPhone: '',
      stops: [],
    });
  }, [dispatch, isOpen, editingRoute, reset]);

  const onSubmit = async (data) => {
    const payload = buildPayload(data);

    if (isEditMode) {
      const resultAction = await dispatch(
        updateTransport({
          transportId: editingRoute._id,
          payload,
        }),
      );

      if (updateTransport.fulfilled.match(resultAction)) {
        onClose();
      }

      return;
    }

    const resultAction = await dispatch(createTransport(payload));
    if (createTransport.fulfilled.match(resultAction)) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Transport Route' : 'Add Transport Route'}
      maxWidth="780px"
    >
      <form className="add-route-form" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="add-route-form__error">
            {typeof error === 'string' ? error : 'An error occurred while saving the route'}
          </div>
        )}

        <div className="add-route-form__grid">
          <div className="add-route-form__group">
            <label className="add-route-form__label" htmlFor="routeName">Route Name *</label>
            <input
              id="routeName"
              type="text"
              className={`add-route-form__input ${errors.routeName ? 'add-route-form__input--error' : ''}`}
              placeholder="e.g. North Campus Loop"
              disabled={loading}
              {...register('routeName')}
            />
            {errors.routeName && (
              <span className="add-route-form__field-error">{errors.routeName.message}</span>
            )}
          </div>

          <div className="add-route-form__group">
            <label className="add-route-form__label" htmlFor="vehicleNumber">Vehicle Number *</label>
            <input
              id="vehicleNumber"
              type="text"
              className={`add-route-form__input ${errors.vehicleNumber ? 'add-route-form__input--error' : ''}`}
              placeholder="e.g. MH-12-AB-1234"
              disabled={loading}
              {...register('vehicleNumber')}
            />
            {errors.vehicleNumber && (
              <span className="add-route-form__field-error">{errors.vehicleNumber.message}</span>
            )}
          </div>

          <div className="add-route-form__group">
            <label className="add-route-form__label" htmlFor="driverName">Driver Name *</label>
            <input
              id="driverName"
              type="text"
              className={`add-route-form__input ${errors.driverName ? 'add-route-form__input--error' : ''}`}
              placeholder="e.g. Ravi Kumar"
              disabled={loading}
              {...register('driverName')}
            />
            {errors.driverName && (
              <span className="add-route-form__field-error">{errors.driverName.message}</span>
            )}
          </div>

          <div className="add-route-form__group">
            <label className="add-route-form__label" htmlFor="driverPhone">Driver Phone *</label>
            <input
              id="driverPhone"
              type="text"
              className={`add-route-form__input ${errors.driverPhone ? 'add-route-form__input--error' : ''}`}
              placeholder="e.g. +91 98765 43210"
              disabled={loading}
              {...register('driverPhone')}
            />
            {errors.driverPhone && (
              <span className="add-route-form__field-error">{errors.driverPhone.message}</span>
            )}
          </div>
        </div>

        <div className="add-route-form__stops-section">
          <div className="add-route-form__stops-header">
            <h3 className="add-route-form__stops-title">Stops</h3>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => append({ ...EMPTY_STOP })}
              disabled={loading}
            >
              Add Stop
            </button>
          </div>

          {fields.length === 0 && (
            <p className="add-route-form__stops-empty">No stops added yet.</p>
          )}

          <div className="add-route-form__stops-list">
            {fields.map((field, index) => (
              <div key={field.id} className="add-route-form__stop-card">
                <div className="add-route-form__stop-card-header">
                  <h4 className="add-route-form__stop-title">Stop {index + 1}</h4>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => remove(index)}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>

                <div className="add-route-form__stop-grid">
                  <div className="add-route-form__group add-route-form__group--wide">
                    <label className="add-route-form__label" htmlFor={`stops.${index}.stopName`}>
                      Stop Name *
                    </label>
                    <input
                      id={`stops.${index}.stopName`}
                      type="text"
                      className={`add-route-form__input ${errors.stops?.[index]?.stopName ? 'add-route-form__input--error' : ''}`}
                      placeholder="e.g. Central Market"
                      disabled={loading}
                      {...register(`stops.${index}.stopName`)}
                    />
                    {errors.stops?.[index]?.stopName && (
                      <span className="add-route-form__field-error">
                        {errors.stops[index].stopName.message}
                      </span>
                    )}
                  </div>

                  <div className="add-route-form__group">
                    <label className="add-route-form__label" htmlFor={`stops.${index}.pickUpTime`}>
                      Pick-up Time
                    </label>
                    <input
                      id={`stops.${index}.pickUpTime`}
                      type="time"
                      className={`add-route-form__input ${errors.stops?.[index]?.pickUpTime ? 'add-route-form__input--error' : ''}`}
                      disabled={loading}
                      {...register(`stops.${index}.pickUpTime`)}
                    />
                    {errors.stops?.[index]?.pickUpTime && (
                      <span className="add-route-form__field-error">
                        {errors.stops[index].pickUpTime.message}
                      </span>
                    )}
                  </div>

                  <div className="add-route-form__group">
                    <label className="add-route-form__label" htmlFor={`stops.${index}.dropTime`}>
                      Drop Time
                    </label>
                    <input
                      id={`stops.${index}.dropTime`}
                      type="time"
                      className={`add-route-form__input ${errors.stops?.[index]?.dropTime ? 'add-route-form__input--error' : ''}`}
                      disabled={loading}
                      {...register(`stops.${index}.dropTime`)}
                    />
                    {errors.stops?.[index]?.dropTime && (
                      <span className="add-route-form__field-error">
                        {errors.stops[index].dropTime.message}
                      </span>
                    )}
                  </div>

                  <div className="add-route-form__group">
                    <label className="add-route-form__label" htmlFor={`stops.${index}.feeAmount`}>
                      Stop Fee
                    </label>
                    <input
                      id={`stops.${index}.feeAmount`}
                      type="number"
                      min="0"
                      step="0.01"
                      className={`add-route-form__input ${errors.stops?.[index]?.feeAmount ? 'add-route-form__input--error' : ''}`}
                      placeholder="Optional"
                      disabled={loading}
                      {...register(`stops.${index}.feeAmount`)}
                    />
                    {errors.stops?.[index]?.feeAmount && (
                      <span className="add-route-form__field-error">
                        {errors.stops[index].feeAmount.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="add-route-form__actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Route' : 'Create Route'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddRouteModal;
