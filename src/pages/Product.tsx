import React, { useState, useMemo, useEffect } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  TagIcon,
  ArchiveBoxIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { get, post, put, del, upload } from '../lib/apiClient';
import { toast } from 'sonner';

const emptyForm = {
  name: '',
  description: '',
  category: '',
  buyingPrice: '',
  sellingPrice: '',
  stock: '',
  image: ''
};

const ProductManagement = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({ ...emptyForm });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await get('/api/products', { limit: 100 });
      setProducts(data.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await get('/api/categories');
      setCategories(data.data || []);
    } catch {
      // silent — categories just won't populate
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const catId = product.category?._id || product.category;
      const matchesCategory =
        selectedCategory === 'All' || catId === selectedCategory;
      const matchesSearch =
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const totalValue = products.reduce(
      (sum, p) => sum + (p.stock || 0) * (p.buyingPrice || 0),
      0
    );
    const categoriesCount = new Set(products.map((p) => p.category?._id || p.category)).size;
    return { totalProducts, totalStock, totalValue, categoriesCount };
  }, [products]);

  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm({ ...emptyForm });
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      category: product.category?._id || product.category || '',
      buyingPrice: String(product.buyingPrice || ''),
      sellingPrice: String(product.sellingPrice || ''),
      stock: String(product.stock || ''),
      image: product.images?.[0] || ''
    });
    setImageFile(null);
    setImagePreview(product.images?.[0] || '');
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setProductForm((prev) => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = productForm.image;
    if (imageFile) {
      try {
        const res = await upload('/api/upload', imageFile);
        imageUrl = res.url;
      } catch {
        toast.error('Image upload failed');
        return;
      }
    }

    const payload = {
      name: productForm.name,
      description: productForm.description,
      category: productForm.category,
      buyingPrice: parseFloat(productForm.buyingPrice),
      sellingPrice: parseFloat(productForm.sellingPrice),
      stock: parseInt(productForm.stock),
      ...(imageUrl ? { images: [imageUrl] } : {}),
    };

    try {
      if (editingProduct) {
        await put(`/api/products/${editingProduct._id}`, payload);
        toast.success('Product updated');
      } else {
        await post('/api/products', payload);
        toast.success('Product added');
      }
      setIsModalOpen(false);
      await fetchProducts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save product');
    }
  };

  const handleDelete = async (product: any) => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    try {
      await del(`/api/products/${product._id}`);
      toast.success('Product deleted');
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete product');
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const getProfitMargin = (buyingPrice, sellingPrice) =>
    ((sellingPrice - buyingPrice) / buyingPrice * 100).toFixed(1);

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock < 10) return { text: 'Low Stock', color: 'bg-orange-100 text-orange-800' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600 mt-2">Manage your product inventory and catalog</p>
            </div>
            <button
              onClick={openAddModal}
              className="mt-4 sm:mt-0 flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <PlusIcon className="h-5 w-5" />
              Add New Product
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ArchiveBoxIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stock</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalStock}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TagIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <PhotoIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.categoriesCount}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <MagnifyingGlassIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-3 min-h-[44px] rounded-lg font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === 'All'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat._id)}
                  className={`px-4 py-3 min-h-[44px] rounded-lg font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === cat._id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 min-h-[44px] text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock);
            const profitMargin = getProfitMargin(product.buyingPrice, product.sellingPrice);
            const image = product.images?.[0] || '';

            return (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  {image ? (
                    <img
                      src={image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <ArchiveBoxIcon className="h-16 w-16 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-black bg-opacity-75 text-white px-2 py-1 text-xs font-semibold rounded">
                      {product.category?.name || product.category}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Buying Price:</span>
                      <span className="text-sm font-medium text-gray-700">
                        {formatCurrency(product.buyingPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Selling Price:</span>
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(product.sellingPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Profit Margin:</span>
                      <span className="text-sm font-medium text-blue-600">
                        {profitMargin}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Stock:</span>
                      <span className="text-sm font-medium text-gray-700">
                        {product.stock} units
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Add / Edit Product Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end sm:items-center justify-center min-h-screen px-0 sm:px-4 pb-0 sm:pb-20">
              <div
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                onClick={() => setIsModalOpen(false)}
              ></div>

              <div className="relative w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-lg shadow-xl p-5 sm:p-6">
                <div className="w-full">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={productForm.name}
                          onChange={handleFormChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter product name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category *
                        </label>
                        <select
                          name="category"
                          value={productForm.category}
                          onChange={handleFormChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select a category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={productForm.description}
                        onChange={handleFormChange}
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter product description"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Buying Price ($) *
                        </label>
                        <input
                          type="number"
                          name="buyingPrice"
                          value={productForm.buyingPrice}
                          onChange={handleFormChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Selling Price ($) *
                        </label>
                        <input
                          type="number"
                          name="sellingPrice"
                          value={productForm.sellingPrice}
                          onChange={handleFormChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock Quantity *
                        </label>
                        <input
                          type="number"
                          name="stock"
                          value={productForm.stock}
                          onChange={handleFormChange}
                          required
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Image
                      </label>
                      {imagePreview ? (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                            title="Remove image"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                          <PhotoIcon className="h-10 w-10 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">Click to upload image from device</span>
                          <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-5 py-3 min-h-[44px] text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-3 min-h-[44px] text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {editingProduct ? 'Save Changes' : 'Add Product'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
