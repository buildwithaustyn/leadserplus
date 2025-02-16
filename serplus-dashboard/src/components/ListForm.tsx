'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

interface FilterCriterion {
  column: string;
  operator: string;
  value: string;
}

interface List {
  name: string;
  description: string;
  is_dynamic: boolean;
  filter_criteria?: FilterCriterion[];
}

interface ListFormProps {
  onSubmit: (list: List) => void;
  onClose: () => void;
  initialData?: List;
}

const OPERATORS = [
  { value: 'eq', label: 'Equals' },
  { value: 'neq', label: 'Not Equals' },
  { value: 'gt', label: 'Greater Than' },
  { value: 'gte', label: 'Greater Than or Equal' },
  { value: 'lt', label: 'Less Than' },
  { value: 'lte', label: 'Less Than or Equal' },
  { value: 'like', label: 'Contains' },
  { value: 'ilike', label: 'Contains (Case Insensitive)' },
];

const COLUMNS = [
  { value: 'first_name', label: 'First Name' },
  { value: 'last_name', label: 'Last Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'company', label: 'Company' },
  { value: 'job_title', label: 'Job Title' },
  { value: 'status', label: 'Status' },
  { value: 'created_at', label: 'Created Date' },
];

export default function ListForm({ onSubmit, onClose, initialData }: ListFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isDynamic, setIsDynamic] = useState(initialData?.is_dynamic || false);
  const [filterCriteria, setFilterCriteria] = useState<FilterCriterion[]>(
    initialData?.filter_criteria || [
      { column: 'status', operator: 'eq', value: '' },
    ]
  );

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setIsDynamic(initialData.is_dynamic);
      setFilterCriteria(initialData.filter_criteria || [{ column: 'status', operator: 'eq', value: '' }]);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      is_dynamic: isDynamic,
      filter_criteria: isDynamic ? filterCriteria : undefined,
    });
  };

  const addFilterCriterion = () => {
    setFilterCriteria([
      ...filterCriteria,
      { column: 'status', operator: 'eq', value: '' },
    ]);
  };

  const removeFilterCriterion = (index: number) => {
    setFilterCriteria(filterCriteria.filter((_, i) => i !== index));
  };

  const updateFilterCriterion = (
    index: number,
    field: keyof FilterCriterion,
    value: string
  ) => {
    const newCriteria = [...filterCriteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    setFilterCriteria(newCriteria);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {initialData ? 'Edit List' : 'New List'}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isDynamic}
            onChange={(e) => setIsDynamic(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Dynamic List (automatically updates based on criteria)
          </span>
        </label>
      </div>

      {isDynamic && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-700">Filter Criteria</h4>
            <button
              type="button"
              onClick={addFilterCriterion}
              className="text-blue-600 hover:text-blue-700"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-1" />
              Add Filter
            </button>
          </div>

          {filterCriteria.map((criterion, index) => (
            <div key={index} className="flex space-x-2 items-start">
              <div className="flex-1">
                <select
                  value={criterion.column}
                  onChange={(e) =>
                    updateFilterCriterion(index, 'column', e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  {COLUMNS.map((column) => (
                    <option key={column.value} value={column.value}>
                      {column.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <select
                  value={criterion.operator}
                  onChange={(e) =>
                    updateFilterCriterion(index, 'operator', e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  {OPERATORS.map((operator) => (
                    <option key={operator.value} value={operator.value}>
                      {operator.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  value={criterion.value}
                  onChange={(e) =>
                    updateFilterCriterion(index, 'value', e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Value"
                />
              </div>

              {filterCriteria.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFilterCriterion(index)}
                  className="mt-2 text-red-600 hover:text-red-700"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {initialData ? 'Update List' : 'Create List'}
        </button>
      </div>
    </form>
  );
}