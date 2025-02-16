'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faTags,
  faList,
  faFilter,
  faSort,
  faEdit,
  faTrash,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import CategoryForm from './CategoryForm';
import ListForm from './ListForm';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  status: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  description: string;
}

interface FilterCriterion {
  column: string;
  operator: string;
  value: string;
}

interface List {
  id: string;
  name: string;
  description: string;
  is_dynamic: boolean;
  filter_criteria?: FilterCriterion[];
}

interface ListFormData {
  name: string;
  description: string;
  is_dynamic: boolean;
  filter_criteria?: FilterCriterion[];
}

export default function LeadManager() {
  const supabase = createClientComponentClient();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterCriteria, setFilterCriteria] = useState<any>({});
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingList, setEditingList] = useState<List | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchLeads(),
          fetchCategories(),
          fetchLists()
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchLeads();
    }
  }, [selectedCategory, selectedList, sortField, sortDirection, filterCriteria]);

  const fetchLeads = async () => {
    try {
      let query = supabase.from('leads').select('*');

      // Apply category filter
      if (selectedCategory) {
        const { data: categoryLeads } = await supabase
          .from('lead_category_assignments')
          .select('lead_id')
          .eq('category_id', selectedCategory);
        
        if (categoryLeads) {
          const leadIds = categoryLeads.map(item => item.lead_id);
          query = query.in('id', leadIds);
        }
      }

      // Apply list filter
      if (selectedList) {
        const { data: list } = await supabase
          .from('lead_lists')
          .select('*')
          .eq('id', selectedList)
          .single();

        if (list?.is_dynamic && list?.filter_criteria) {
          // Apply dynamic list filters
          list.filter_criteria.forEach((filter: FilterCriterion) => {
            query = query.filter(filter.column, filter.operator, filter.value);
          });
        } else {
          const { data: listLeads } = await supabase
            .from('lead_list_members')
            .select('lead_id')
            .eq('list_id', selectedList);
          
          if (listLeads) {
            const leadIds = listLeads.map(item => item.lead_id);
            query = query.in('id', leadIds);
          }
        }
      }

      // Apply custom filters
      Object.entries(filterCriteria).forEach(([field, value]) => {
        if (value) {
          query = query.ilike(field, `%${value}%`);
        }
      });

      // Apply sorting
      query = query.order(sortField, { ascending: sortDirection === 'asc' });

      const { data, error } = await query;
      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setError('Error fetching leads');
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('lead_categories')
        .select('*')
        .order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Error fetching categories');
    }
  };

  const fetchLists = async () => {
    try {
      const { data, error } = await supabase
        .from('lead_lists')
        .select('*')
        .order('name');
      if (error) throw error;
      setLists(data || []);
    } catch (error) {
      console.error('Error fetching lists:', error);
      setError('Error fetching lists');
    }
  };

  const handleCreateCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please sign in to create a category');
        return;
      }
      
      const { error } = await supabase
        .from('lead_categories')
        .insert([{
          ...category,
          user_id: session.user.id
        }]);
      if (error) throw error;
      fetchCategories();
      setShowCategoryModal(false);
    } catch (error) {
      console.error('Error creating category:', error);
      setError('Error creating category');
    }
  };

  const handleUpdateCategory = async (id: string, category: Omit<Category, 'id'>) => {
    try {
      const { error } = await supabase
        .from('lead_categories')
        .update(category)
        .eq('id', id);
      if (error) throw error;
      fetchCategories();
      setEditingCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Error updating category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lead_categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
      if (selectedCategory === id) setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Error deleting category');
    }
  };

  const handleCreateList = async (list: ListFormData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please sign in to create a list');
        return;
      }

      const { error } = await supabase
        .from('lead_lists')
        .insert([{
          ...list,
          user_id: session.user.id
        }]);
      if (error) throw error;
      fetchLists();
      setShowListModal(false);
    } catch (error) {
      console.error('Error creating list:', error);
      setError('Error creating list');
    }
  };

  const handleUpdateList = async (id: string, list: ListFormData) => {
    try {
      const { error } = await supabase
        .from('lead_lists')
        .update(list)
        .eq('id', id);
      if (error) throw error;
      fetchLists();
      setEditingList(null);
    } catch (error) {
      console.error('Error updating list:', error);
      setError('Error updating list');
    }
  };

  const handleDeleteList = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lead_lists')
        .delete()
        .eq('id', id);
      if (error) throw error;
      if (selectedList === id) setSelectedList(null);
      fetchLists();
    } catch (error) {
      console.error('Error deleting list:', error);
      setError('Error deleting list');
    }
  };

  const handleSort = (field: string) => {
    setSortField(field);
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleFilter = (field: string, value: string) => {
    setFilterCriteria({ ...filterCriteria, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Lead Management</h2>
        <div className="space-x-4">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="btn btn-primary"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            New Category
          </button>
          <button
            onClick={() => setShowListModal(true)}
            className="btn btn-primary"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            New List
          </button>
        </div>
      </div>

      <div className="flex space-x-4">
        {/* Categories */}
        <div className="w-64 bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              <FontAwesomeIcon icon={faTags} className="mr-2" />
              Categories
            </h3>
          </div>
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
                className={`p-2 rounded cursor-pointer flex items-center justify-between ${
                  selectedCategory === category.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50'
                }`}
                style={{ borderLeft: `4px solid ${category.color}` }}
              >
                <span>{category.name}</span>
                <div className="space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCategory(category);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category.id);
                    }}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lists */}
        <div className="w-64 bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              <FontAwesomeIcon icon={faList} className="mr-2" />
              Lists
            </h3>
          </div>
          <div className="space-y-2">
            {lists.map((list) => (
              <div
                key={list.id}
                onClick={() => setSelectedList(
                  selectedList === list.id ? null : list.id
                )}
                className={`p-2 rounded cursor-pointer flex items-center justify-between ${
                  selectedList === list.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span>{list.name}</span>
                <div className="space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingList(list);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list.id);
                    }}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leads Table */}
        <div className="flex-1 bg-white rounded-lg shadow">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-4">
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faFilter}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Filter leads..."
                    className="pl-10 pr-4 py-2 border rounded-lg"
                    onChange={(e) => handleFilter('name', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort('last_name')}
                  >
                    Name
                    <FontAwesomeIcon icon={faSort} className="ml-2" />
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort('company')}
                  >
                    Company
                    <FontAwesomeIcon icon={faSort} className="ml-2" />
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    Status
                    <FontAwesomeIcon icon={faSort} className="ml-2" />
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort('created_at')}
                  >
                    Created
                    <FontAwesomeIcon icon={faSort} className="ml-2" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {lead.first_name} {lead.last_name}
                    </td>
                    <td className="px-4 py-2">{lead.company}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          lead.status === 'new'
                            ? 'bg-blue-100 text-blue-600'
                            : lead.status === 'contacted'
                            ? 'bg-yellow-100 text-yellow-600'
                            : lead.status === 'qualified'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <CategoryForm
              onSubmit={handleCreateCategory}
              onClose={() => setShowCategoryModal(false)}
            />
          </div>
        </div>
      )}

      {/* Category Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <CategoryForm
              onSubmit={(category) => handleUpdateCategory(editingCategory.id, category)}
              onClose={() => setEditingCategory(null)}
              initialData={editingCategory}
            />
          </div>
        </div>
      )}

      {/* List Modal */}
      {showListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <ListForm
              onSubmit={handleCreateList}
              onClose={() => setShowListModal(false)}
            />
          </div>
        </div>
      )}

      {/* List Edit Modal */}
      {editingList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <ListForm
              onSubmit={(list) => handleUpdateList(editingList.id, list)}
              onClose={() => setEditingList(null)}
              initialData={editingList}
            />
          </div>
        </div>
      )}
    </div>
  );
}