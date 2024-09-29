import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import SimpleAppBar from '../SimpleAppBar/SimpleAppBar';

const MindMap = () => {
  const location = useLocation();
  const { file } = location.state || {};
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle generate mind map
  const handleGenerateMindMap = async () => {
    if (!file) {
      alert("Please upload a file first");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/mindmap', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate mind map');
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error('Error generating mind map:', error);
      alert('Error generating mind map.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SimpleAppBar />
      <Container sx={{ mt: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Generate Mind Map
          </Typography>
          <Typography variant="body1" gutterBottom>
            Our AI will generate a summarized version of the uploaded lecture PDF as a mind map.
          </Typography>

          {file && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">Uploaded File: {file.name}</Typography>
              <Button
                variant="contained"
                color="success"
                onClick={handleGenerateMindMap}
                sx={{ mt: 2 }}
              >
                Generate Mind Map
              </Button>
            </Box>
          )}

          {loading && (
            <Box sx={{ mt: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {summary && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5">Mind Map Summary:</Typography>
              <Typography variant="body1">{summary}</Typography>
            </Box>
          )}
        </Box>
      </Container>
    </div>
  );
};

export default MindMap;