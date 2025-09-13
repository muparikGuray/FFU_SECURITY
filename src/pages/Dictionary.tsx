import React, { useState, useEffect } from 'react';
import { DictionaryTerm } from '../types';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import { Search, BookmarkPlus, Bookmark, Plus } from 'lucide-react';

const Dictionary: React.FC = () => {
  const [terms, setTerms] = useState<DictionaryTerm[]>([]);
  const [filteredTerms, setFilteredTerms] = useState<DictionaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<DictionaryTerm | null>(null);
  const [showBookmarked, setShowBookmarked] = useState(false);

  const categories = [
    { value: 'protocols', label: 'Protocols', count: 0 },
    { value: 'threats', label: 'Threats', count: 0 },
    { value: 'tools', label: 'Tools', count: 0 },
    { value: 'concepts', label: 'Concepts', count: 0 }
  ];

  useEffect(() => {
    loadTerms();
  }, []);

  useEffect(() => {
    filterTerms();
  }, [terms, searchTerm, selectedCategory, showBookmarked]);

  const loadTerms = async () => {
    try {
      // Load default terms for demonstration
      const defaultTerms: DictionaryTerm[] = [
        {
          id: '1',
          term: 'Firewall',
          definition: 'A network security device that monitors and filters incoming and outgoing network traffic based on predetermined security rules.',
          category: 'concepts',
          examples: 'Hardware firewalls, software firewalls, next-generation firewalls (NGFW)',
          related_terms: ['Network Security', 'Access Control', 'Packet Filtering'],
          bookmarked: false,
          created_at: new Date().toISOString(),
          user_id: 'demo-user'
        },
        {
          id: '2',
          term: 'TCP',
          definition: 'Transmission Control Protocol - A connection-oriented protocol that ensures reliable delivery of data between applications.',
          category: 'protocols',
          examples: 'HTTP, HTTPS, FTP, SMTP all use TCP',
          related_terms: ['UDP', 'IP', 'Three-way Handshake'],
          bookmarked: false,
          created_at: new Date().toISOString(),
          user_id: 'demo-user'
        },
        {
          id: '3',
          term: 'DDoS',
          definition: 'Distributed Denial of Service - A cyber attack that floods a target with traffic from multiple sources to make it unavailable.',
          category: 'threats',
          examples: 'Volumetric attacks, Protocol attacks, Application layer attacks',
          related_terms: ['DoS', 'Botnet', 'Traffic Analysis'],
          bookmarked: false,
          created_at: new Date().toISOString(),
          user_id: 'demo-user'
        },
        {
          id: '4',
          term: 'Wireshark',
          definition: 'A free and open-source packet analyzer used for network troubleshooting, analysis, and security auditing.',
          category: 'tools',
          examples: 'Network protocol analysis, security investigation, performance monitoring',
          related_terms: ['Packet Sniffer', 'Network Analysis', 'Protocol Decoder'],
          bookmarked: false,
          created_at: new Date().toISOString(),
          user_id: 'demo-user'
        },
        {
          id: '5',
          term: 'IDS',
          definition: 'Intrusion Detection System - A security tool that monitors network traffic and system activities for malicious activities.',
          category: 'concepts',
          examples: 'Network-based IDS (NIDS), Host-based IDS (HIDS), Signature-based detection',
          related_terms: ['IPS', 'SIEM', 'Anomaly Detection'],
          bookmarked: false,
          created_at: new Date().toISOString(),
          user_id: 'demo-user'
        },
        {
          id: '6',
          term: 'VPN',
          definition: 'Virtual Private Network - A secure connection that allows users to access a private network over the internet.',
          category: 'concepts',
          examples: 'Site-to-site VPN, Remote access VPN, SSL VPN',
          related_terms: ['Encryption', 'Tunneling', 'Authentication'],
          bookmarked: false,
          created_at: new Date().toISOString(),
          user_id: 'demo-user'
        }
      ];
      
      setTerms(defaultTerms);
    } catch (error) {
      console.error('Error loading dictionary terms:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTerms = () => {
    let filtered = terms;

    if (searchTerm) {
      filtered = filtered.filter(term => 
        term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.examples?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(term => term.category === selectedCategory);
    }

    if (showBookmarked) {
      filtered = filtered.filter(term => term.bookmarked);
    }

    setFilteredTerms(filtered);
  };

  const toggleBookmark = async (termId: string, currentBookmark: boolean) => {
    try {
      // Mock toggle bookmark functionality
      setTerms(prev => prev.map(term => 
        term.id === termId 
          ? { ...term, bookmarked: !currentBookmark }
          : term
      ));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const addTerm = async (termData: Omit<DictionaryTerm, 'id' | 'created_at' | 'user_id'>) => {
    try {
      // Mock add term functionality
      const newTerm: DictionaryTerm = {
        ...termData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        user_id: 'demo-user'
      };
      
      setTerms(prev => [...prev, newTerm]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding term:', error);
    }
  };

  // Update category counts
  categories.forEach(cat => {
    cat.count = terms.filter(term => term.category === cat.value).length;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Security Dictionary</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Term
        </button>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search terms, definitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All Categories ({terms.length})
            </button>
            
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === category.value 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
            
            <button
              onClick={() => setShowBookmarked(!showBookmarked)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                showBookmarked 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Bookmark className="h-4 w-4 inline mr-1" />
              Bookmarked ({terms.filter(t => t.bookmarked).length})
            </button>
          </div>
        </div>
      </Card>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTerms.map(term => (
          <Card key={term.id} className="cursor-pointer hover:bg-gray-750 transition-colors">
            <div 
              onClick={() => setSelectedTerm(term)}
              className="space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{term.term}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    term.category === 'protocols' ? 'bg-blue-500/10 text-blue-400' :
                    term.category === 'threats' ? 'bg-red-500/10 text-red-400' :
                    term.category === 'tools' ? 'bg-green-500/10 text-green-400' :
                    'bg-purple-500/10 text-purple-400'
                  }`}>
                    {term.category}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(term.id, term.bookmarked);
                  }}
                  className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  {term.bookmarked ? (
                    <Bookmark className="h-5 w-5 fill-current text-yellow-400" />
                  ) : (
                    <BookmarkPlus className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              <p className="text-gray-300 text-sm line-clamp-3">
                {term.definition}
              </p>
              
              {term.examples && (
                <p className="text-gray-400 text-xs">
                  <strong>Examples:</strong> {term.examples.slice(0, 80)}...
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredTerms.length === 0 && !loading && (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-400">No terms found matching your criteria.</p>
          </div>
        </Card>
      )}

      {/* Term Detail Modal */}
      <Modal
        isOpen={selectedTerm !== null}
        onClose={() => setSelectedTerm(null)}
        title={selectedTerm?.term || ''}
        size="lg"
      >
        {selectedTerm && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                selectedTerm.category === 'protocols' ? 'bg-blue-500/10 text-blue-400' :
                selectedTerm.category === 'threats' ? 'bg-red-500/10 text-red-400' :
                selectedTerm.category === 'tools' ? 'bg-green-500/10 text-green-400' :
                'bg-purple-500/10 text-purple-400'
              }`}>
                {selectedTerm.category}
              </span>
              
              <button
                onClick={() => toggleBookmark(selectedTerm.id, selectedTerm.bookmarked)}
                className="flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
              >
                {selectedTerm.bookmarked ? (
                  <>
                    <Bookmark className="h-4 w-4 fill-current text-yellow-400" />
                    <span>Bookmarked</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="h-4 w-4" />
                    <span>Bookmark</span>
                  </>
                )}
              </button>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Definition</h4>
              <p className="text-white">{selectedTerm.definition}</p>
            </div>
            
            {selectedTerm.examples && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Examples</h4>
                <p className="text-gray-300">{selectedTerm.examples}</p>
              </div>
            )}
            
            {selectedTerm.related_terms && selectedTerm.related_terms.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Related Terms</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTerm.related_terms.map((relatedTerm, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-700 text-gray-300 rounded-md text-sm"
                    >
                      {relatedTerm}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Term Modal */}
      <AddTermModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addTerm}
      />
    </div>
  );
};

const AddTermModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAdd: (term: any) => void;
}> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    term: '',
    definition: '',
    category: 'concepts' as 'protocols' | 'threats' | 'tools' | 'concepts',
    examples: '',
    related_terms: [] as string[],
    bookmarked: false
  });

  const [relatedTermInput, setRelatedTermInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      related_terms: formData.related_terms.length > 0 ? formData.related_terms : undefined
    });
    setFormData({
      term: '',
      definition: '',
      category: 'concepts',
      examples: '',
      related_terms: [],
      bookmarked: false
    });
    setRelatedTermInput('');
  };

  const addRelatedTerm = () => {
    if (relatedTermInput.trim() && !formData.related_terms.includes(relatedTermInput.trim())) {
      setFormData({
        ...formData,
        related_terms: [...formData.related_terms, relatedTermInput.trim()]
      });
      setRelatedTermInput('');
    }
  };

  const removeRelatedTerm = (index: number) => {
    setFormData({
      ...formData,
      related_terms: formData.related_terms.filter((_, i) => i !== index)
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Term" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Term *
            </label>
            <input
              type="text"
              required
              value={formData.term}
              onChange={(e) => setFormData({ ...formData, term: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="concepts">Concepts</option>
              <option value="protocols">Protocols</option>
              <option value="threats">Threats</option>
              <option value="tools">Tools</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Definition *
          </label>
          <textarea
            required
            value={formData.definition}
            onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Examples
          </label>
          <textarea
            value={formData.examples}
            onChange={(e) => setFormData({ ...formData, examples: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Related Terms
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={relatedTermInput}
              onChange={(e) => setRelatedTermInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRelatedTerm())}
              placeholder="Add related term"
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addRelatedTerm}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
          {formData.related_terms.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.related_terms.map((term, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-600 text-gray-200 rounded-md text-sm flex items-center space-x-1"
                >
                  <span>{term}</span>
                  <button
                    type="button"
                    onClick={() => removeRelatedTerm(index)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Term
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default Dictionary;