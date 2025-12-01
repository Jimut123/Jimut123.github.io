#!/bin/bash

########################################
########################################


# Create virtual environment
python3 -m venv venv

source venv/bin/activate
pip install -r requirements.txt

set -e  # Exit on error

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Run Python script
echo "Running SEARCH_JSON_DUMP.py..."
python SEARCH_JSON_DUMP.py

# Deactivate virtual environment (optional)
deactivate

# Rest of your script...
echo "Python script completed successfully!"

########################################
########################################



# Replace http://localhost:4000/ with https://jimut123.github.io/ in all files in _site directory
# Version with progress bar

echo "Starting replacement in _site directory..."
echo ""

# Set locale to handle UTF-8 properly
export LC_ALL=C

# Count total files first
echo "Counting files..."
total_files=$(find _site -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.xml" -o -name "*.json" -o -name "*.txt" \) | wc -l | tr -d ' ')
echo "Found $total_files files to process"
echo ""

# Progress bar function
progress_bar() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local completed=$((width * current / total))
    local remaining=$((width - completed))
    
    printf "\rProgress: ["
    printf "%${completed}s" | tr ' ' '='
    printf "%${remaining}s" | tr ' ' ' '
    printf "] %d%% (%d/%d files)" $percentage $current $total
}

# Counter for processed files
count=0
updated_count=0

# Process files with progress bar
find _site -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.xml" -o -name "*.json" -o -name "*.txt" \) | while read file; do
    ((count++))
    
    if grep -q "http://localhost:4000/" "$file" 2>/dev/null; then
        sed -i '' 's|http://localhost:4000/|https://jimut123.github.io/|g' "$file" 2>/dev/null
        ((updated_count++))
    fi
    
    progress_bar $count $total_files
done

echo ""
echo ""
echo "✓ Replacement complete!"
echo "✓ All instances of 'http://localhost:4000/' have been replaced with 'https://jimut123.github.io/'"
echo ""
echo "Verification - sample replacements found:"
grep -r "jimut123.github.io" _site --include="*.html" | head -n 3