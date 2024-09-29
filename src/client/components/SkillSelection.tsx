import { useState } from "react";
import { Obsession } from "../../common/types";
import { Box, Button, Card, Typography } from "@mui/joy";
import StarIcon from '@mui/icons-material/Star'; // Importing a star icon

interface SkillSelectionGridProps {
  skills: string[];
  obsessions: Obsession[];
  onSubmit: (selectedSkills: string[], selectedObsession: Obsession) => void;
}

const SkillSelection: React.FC<SkillSelectionGridProps> = ({
  skills,
  obsessions,
  onSubmit,
}) => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedObsession, setSelectedObsession] = useState<Obsession | null>(
    null
  );

  // Handle selection for skills
  const handleSkillClick = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else if (selectedSkills.length < 2) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Handle selection for obsession
  const handleObsessionClick = (obsession: Obsession) => {
    setSelectedObsession(obsession === selectedObsession ? null : obsession);
  };

  const handleSubmit = () => {
    if (selectedSkills.length === 2 && selectedObsession) {
      onSubmit(selectedSkills, selectedObsession);
    } else {
      alert("Please select exactly 2 skills and 1 obsession.");
    }
  };

  // Function to render stars based on rank
  const renderStars = (rank: number) => {
    return (
      <Box display="flex">
        {[...Array(rank)].map((_, index) => (
          <StarIcon
            key={index}
            color={"action"} // Fill stars based on rank
            sx={{ fontSize: 20 }} // Adjust size of stars
          />
        ))}
      </Box>
    );
  };

  return (
    <Card sx={{ width: 650 }}>
      <Box>
        {/* Skills Grid */}
        <Box mb={3}>
          <Typography level="h3">Select Two Skills</Typography>
          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(100px, 1fr))"
            gap={2}
            mt={1}
          >
            {skills.map((skill, index) => (
              <Button
                key={index}
                variant={selectedSkills.includes(skill) ? "outlined" : "plain"}
                onClick={() => handleSkillClick(skill)}
                sx={{
                  cursor: "pointer",
                  padding: "16px",
                  textAlign: "center",
                  alignSelf: "center",
                  backgroundColor: selectedSkills.includes(skill)
                    ? "primary.softFocus" // JoyUI primary color when selected
                    : "background.body", // JoyUI default background
                  border: selectedSkills.includes(skill) ? '2px solid #4caf50' : 'none', // Thicker success-green border
                  "&:hover": {
                    backgroundColor: selectedSkills.length < 2
                      ? "primary.hover" // JoyUI hover color when not fully selected
                      : "inherit", // No hover effect if two skills are selected
                  },
                  "&:active": {
                    backgroundColor: selectedSkills.includes(skill)
                      ? "primary.active" // JoyUI active color when selected
                      : "primary.main", // JoyUI primary color when active
                  },
                }}
              >
                <Typography>{skill}</Typography>
              </Button>
            ))}
          </Box>
        </Box>

        {/* Obsession Grid */}
        <Box mb={3}>
          <Typography level="h3">Select One Obsession</Typography>
          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(100px, 1fr))"
            gap={2}
            mt={1}
          >
            {obsessions.map((obsession, index) => (
              <Button
                key={index}
                variant={selectedObsession === obsession ? "outlined" : "plain"}
                onClick={() => handleObsessionClick(obsession)}
                sx={{
                  cursor: "pointer",
                  padding: "16px",
                  textAlign: "center",
                  alignSelf: "center",
                  backgroundColor: selectedObsession === obsession
                    ? "primary.softFocus" // JoyUI primary color when selected
                    : "background.body", // JoyUI default background
                  border: selectedObsession === obsession ? '2px solid #4caf50' : 'none', // Thicker success-green border
                  "&:hover": {
                    backgroundColor: selectedObsession === obsession
                      ? "primary.hover" // JoyUI hover color when selected
                      : "primary.softHover", // JoyUI hover color when not selected
                  },
                  "&:active": {
                    backgroundColor: selectedObsession === obsession
                      ? "primary.active" // JoyUI active color when selected
                      : "primary.main", // JoyUI primary color when active
                  },
                }}
              >
                <Typography>{obsession.description}</Typography>
                {renderStars(obsession.rank)} {/* Display stars based on rank */}
              </Button>
            ))}
          </Box>
        </Box>

        <Button
          onClick={handleSubmit}
          disabled={selectedSkills.length !== 2 || !selectedObsession}
          sx={{
            backgroundColor: "primary.main", // Default JoyUI primary color
            "&:hover": {
              backgroundColor: "primary.hover", // JoyUI hover color
            },
            "&:active": {
              backgroundColor: "primary.active", // JoyUI active color
            },
          }}
        >
          Submit Selection
        </Button>
      </Box>
    </Card>
  );
};

export default SkillSelection;