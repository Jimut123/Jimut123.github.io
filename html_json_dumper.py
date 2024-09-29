import os
import json
from bs4 import BeautifulSoup

def extract_and_format_to_json(folder_path, output_file):
    output_data = []  # List to hold all extracted data

    # Traverse through all files and subfolders in the given folder
    for root, _, files in os.walk(folder_path):
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    # Parse the HTML content using BeautifulSoup
                    soup = BeautifulSoup(f, 'html.parser')

                    # Extract permalink (using file_path)
                    permalink = file_path
                    permalink = permalink.replace('./', 'https://jimut123.github.io/')

                    # Extract text from <div> with id "pad-container"
                    pad_container_div = soup.find('div', id='pad-container')
                    clean_text = ''
                    
                    if pad_container_div:
                        # Get text content without HTML tags and format it
                        text_content = pad_container_div.get_text(separator=' ')
                        # Remove extra spaces and format as a single line
                        clean_text = ' '.join(text_content.split())
                    
                    # Extract text from <b> tags within <h1> with id "heading-font"
                    headings = [b.get_text(strip=True) for h1 in soup.find_all('h1') for b in h1.find_all('b', id='heading-font')]
                    
                    # Use the headings as the title
                    title = ', '.join(headings) if headings else "No Title"

                    # Only add to output data if title is not "No Title"
                    if title != "No Title":
                        output_data.append({
                            "content": clean_text,
                            "permalink": permalink,
                            "title": title,
                            "summary": clean_text[:100]  # Extract first 100 characters as summary
                        })

    # Write the output data to a JSON file
    with open(output_file, 'w', encoding='utf-8') as json_file:
        json.dump(output_data, json_file, ensure_ascii=False, indent=4)

# Replace with your target folder path and desired output JSON file name
folder_path = './blogs/'
output_file = 'output_data.json'
extract_and_format_to_json(folder_path, output_file)
