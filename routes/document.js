const express = require('express');
const { authenticateSession } = require('../middleware/auth');
const Document = require('../models/document');
const path = require('path');
const router = express.Router();

//  Download document (protected route)
router.get('/:id/download', authenticateSession, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).render('error', { 
        title: 'Not Found', 
        message: 'Document not found' 
      });
    }

    // Verify ownership
    if (doc.userId.toString() !== req.session.userId) {
      return res.status(403).render('error', { 
        title: 'Forbidden', 
        message: 'You do not have permission to access this document' 
      });
    }

    //  Construct full file path
    const filePath = path.join(__dirname, '..', 'private_uploads', doc.filePath);

    // Verify file exists
    if (!require('fs').existsSync(filePath)) {
      return res.status(404).render('error', { 
        title: 'Not Found', 
        message: 'File not found on server' 
      });
    }

    // Send file with original name for download
    res.download(filePath, doc.fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).render('error', { 
          title: 'Error', 
          message: 'Failed to download file' 
        });
      }
    });
  } catch (error) {
    console.error('Download server error:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Server error during download' 
    });
  }
});

// View document in browser (if supported)
router.get('/:id/view', authenticateSession, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc || doc.userId.toString() !== req.session.userId) {
      return res.status(403).render('error', { 
        title: 'Forbidden', 
        message: 'You do not have permission to access this document' 
      });
    }

    const filePath = path.join(__dirname, '..', 'private_uploads', doc.filePath);

    if (!require('fs').existsSync(filePath)) {
      return res.status(404).render('error', { 
        title: 'Not Found', 
        message: 'File not found on server' 
      });
    }

    // Serve inline if it's an image or PDF
    const mime = doc.mimeType;
    if (mime === 'application/pdf' || mime.startsWith('image/')) {
      res.sendFile(filePath, { headers: { 'Content-Type': mime } });
    } else {
      // Otherwise, force download
      res.download(filePath, doc.fileName);
    }
  } catch (error) {
    console.error('View error:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Server error viewing file' 
    });
  }
});

// Delete document (POST to prevent CSRF)
router.post('/:id/delete', authenticateSession, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc || doc.userId.toString() !== req.session.userId) {
      return res.status(403).send('Access denied');
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '..', 'private_uploads', doc.filePath);
    if (require('fs').existsSync(filePath)) {
      require('fs').unlinkSync(filePath);
    }

    await Document.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).render('error', { message: 'Failed to delete document' });
  }
});

module.exports = router;