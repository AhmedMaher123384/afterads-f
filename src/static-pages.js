const { db } = require('./config/firebase');
const { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } = require('firebase/firestore');

const COLLECTION_NAME = 'staticPages';

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { httpMethod, path, queryStringParameters, body } = event;
    const pathSegments = path.split('/').filter(segment => segment);
    
    console.log('📄 Static Pages API Called:', {
      method: httpMethod,
      path,
      timestamp: new Date().toISOString()
    });

    console.log('📄 Static Pages API - Method:', httpMethod, 'Path:', path, 'Segments:', pathSegments);

    switch (httpMethod) {
      case 'GET':
        if (pathSegments.length === 3) {
          // GET /static-pages - Get all static pages
          return await getAllStaticPages(queryStringParameters);
        } else if (pathSegments.length === 4) {
          // GET /static-pages/{id} - Get static page by ID or slug
          const identifier = pathSegments[3];
          return await getStaticPageByIdOrSlug(identifier);
        }
        break;

      case 'POST':
        if (pathSegments.length === 3) {
          // POST /static-pages - Create new static page
          return await createStaticPage(JSON.parse(body));
        }
        break;

      case 'PUT':
        if (pathSegments.length === 4) {
          // PUT /static-pages/{id} - Update static page
          const id = pathSegments[3];
          return await updateStaticPage(id, JSON.parse(body));
        }
        break;

      case 'DELETE':
        if (pathSegments.length === 4) {
          // DELETE /static-pages/{id} - Delete static page
          const id = pathSegments[3];
          return await deleteStaticPage(id);
        }
        break;

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found' })
    };

  } catch (error) {
    console.error('❌ Static Pages API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};

// Get all static pages
async function getAllStaticPages(queryParams = {}) {
  try {
    console.log('📄 Fetching all static pages from Firestore');
    
    const staticPagesRef = collection(db, COLLECTION_NAME);
    let q = query(staticPagesRef, orderBy('createdAt', 'desc'));
    
    // Add filters if provided
    if (queryParams?.isActive === 'true') {
      q = query(staticPagesRef, where('isActive', '==', true), orderBy('createdAt', 'desc'));
    }
    
    if (queryParams?.showInFooter === 'true') {
      q = query(staticPagesRef, where('showInFooter', '==', true), orderBy('createdAt', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    const staticPages = [];
    
    snapshot.forEach(doc => {
      staticPages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ Found ${staticPages.length} static pages in Firestore`);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(staticPages)
    };
  } catch (error) {
    console.error('❌ Error fetching static pages:', error);
    throw error;
  }
}

// Get static page by ID or slug
async function getStaticPageByIdOrSlug(identifier) {
  try {
    console.log('📄 Fetching static page by identifier:', identifier);
    
    let staticPage = null;
    
    // Try to get by ID first
    try {
      const docRef = doc(db, COLLECTION_NAME, identifier);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        staticPage = {
          id: docSnap.id,
          ...docSnap.data()
        };
      }
    } catch (idError) {
      console.log('📄 Not found by ID, trying by slug...');
    }
    
    // If not found by ID, try by slug
    if (!staticPage) {
      const staticPagesRef = collection(db, COLLECTION_NAME);
      const q = query(staticPagesRef, where('slug', '==', identifier));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        staticPage = {
          id: doc.id,
          ...doc.data()
        };
      }
    }
    
    if (!staticPage) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Static page not found' })
      };
    }
    
    console.log('✅ Found static page:', staticPage.title);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(staticPage)
    };
  } catch (error) {
    console.error('❌ Error fetching static page:', error);
    throw error;
  }
}

// Create new static page
async function createStaticPage(pageData) {
  try {
    console.log('📄 Creating new static page:', pageData.title);
    
    // Validate required fields
    if (!pageData.title || !pageData.slug || !pageData.content) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Missing required fields: title, slug, content' 
        })
      };
    }
    
    // Check if slug already exists
    const staticPagesRef = collection(db, COLLECTION_NAME);
    const slugQuery = query(staticPagesRef, where('slug', '==', pageData.slug));
    const slugSnapshot = await getDocs(slugQuery);
    
    if (!slugSnapshot.empty) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'A page with this slug already exists' 
        })
      };
    }
    
    const newPage = {
      ...pageData,
      isActive: pageData.isActive !== undefined ? pageData.isActive : true,
      showInFooter: pageData.showInFooter !== undefined ? pageData.showInFooter : false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newPage);
    
    const createdPage = {
      id: docRef.id,
      ...newPage
    };
    
    console.log('✅ Static page created successfully:', createdPage.id);
    
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createdPage)
    };
  } catch (error) {
    console.error('❌ Error creating static page:', error);
    throw error;
  }
}

// Update static page
async function updateStaticPage(id, pageData) {
  try {
    console.log('📄 Updating static page:', id);
    
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Static page not found' })
      };
    }
    
    // If slug is being updated, check if it already exists
    if (pageData.slug && pageData.slug !== docSnap.data().slug) {
      const staticPagesRef = collection(db, COLLECTION_NAME);
      const slugQuery = query(staticPagesRef, where('slug', '==', pageData.slug));
      const slugSnapshot = await getDocs(slugQuery);
      
      if (!slugSnapshot.empty) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            error: 'A page with this slug already exists' 
          })
        };
      }
    }
    
    const updatedData = {
      ...pageData,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(docRef, updatedData);
    
    const updatedPage = {
      id,
      ...docSnap.data(),
      ...updatedData
    };
    
    console.log('✅ Static page updated successfully:', id);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedPage)
    };
  } catch (error) {
    console.error('❌ Error updating static page:', error);
    throw error;
  }
}

// Delete static page
async function deleteStaticPage(id) {
  try {
    console.log('📄 Deleting static page:', id);
    
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Static page not found' })
      };
    }
    
    await deleteDoc(docRef);
    
    console.log('✅ Static page deleted successfully:', id);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Static page deleted successfully' })
    };
  } catch (error) {
    console.error('❌ Error deleting static page:', error);
    throw error;
  }
}