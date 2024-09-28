import os
import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

# Set up Chrome options
chrome_options = Options()
# chrome_options.add_argument("--headless")  # Uncomment to run headless
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

# Path to your ChromeDriver
driver_path = "D:\\chromedriver-win64\\chromedriver-win64\\chromedriver.exe"  # Replace with the actual path

# Create output directory
output_dir = "usdac_data_scrap"
os.makedirs(output_dir, exist_ok=True)

# Set up the WebDriver
driver = webdriver.Chrome(executable_path=driver_path, options=chrome_options)

try:
    # URL of the page
    url = 'https://ask.usda.gov/s/global-search/food?tabset-fd9ce=2'  # Replace with the actual URL

    # Open the webpage
    driver.get(url)

    # Wait for the initial content to load
    WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CLASS_NAME, "listContent")))

    # Find the element with the class 'listContent'
    list_content = driver.find_element(By.CLASS_NAME, 'listContent')

    # Initialize a list to store hrefs
    hrefs = []

    # Function to collect hrefs from <li> elements
    def collect_hrefs():
        list_items = list_content.find_elements(By.TAG_NAME, 'li')
        for item in list_items:
            # Find the <a> tag within the <li>
            a_tag = item.find_element(By.TAG_NAME, 'a')
            # Get the href attribute and add it to the list
            hrefs.append(a_tag.get_attribute('href'))

    # Collect initial hrefs
    collect_hrefs()

    # Click "Load More" button until we have at least 1000 hrefs
    while len(hrefs) < 1000:
        try:
            load_more_button = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CLASS_NAME, "loadmore")))
            load_more_button.click()
            # Collect hrefs after loading more items
            WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, 'listContent')))
            collect_hrefs()  # Collect hrefs again after loading more items
        except Exception as e:
            print("No more items to load or an error occurred:", e)
            break

    # Initialize a list to store content from each href
    all_contents = []

    # Iterate through each href link to extract <h2> tags and paragraph content
    for count, href in enumerate(hrefs[:1000], start=1):  # Limit to first 1000 hrefs
        driver.get(href)  # Navigate to the href

        # Initialize a dictionary to store the H2 and content
        page_content = {"h2": [], "paragraph": ""}

        # Wait for the <h2> headings to load
        try:
            h2_elements = WebDriverWait(driver, 20).until(EC.presence_of_all_elements_located((By.TAG_NAME, "h2")))
            for h2 in h2_elements:
                page_content["h2"].append(h2.text)  # Store the text of each <h2> tag
        except Exception as e:
            print(f"Could not retrieve H2 tags from {href}: {e}")

        # Wait for the paragraph content to load
        try:
            paragraph = WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CLASS_NAME, "slds-rich-text-editor__output")))
            page_content["paragraph"] = paragraph.text  # Store the text content
        except Exception as e:
            print(f"Could not retrieve content from {href}: {e}")

        # Append the page content to the all_contents list
        all_contents.append({"href": href, "content": page_content})

        # Save contents into JSON files after every 20 links
        if count % 20 == 0:
            json_file_name = os.path.join(output_dir, f"{count - 19}-{count}.json")
            with open(json_file_name, 'w', encoding='utf-8') as json_file:
                json.dump(all_contents[-20:], json_file, ensure_ascii=False, indent=4)
            print(f"Saved entries {count - 19} to {count} to {json_file_name}")

        # Print status of the link processed
        print(f"Link {count} done: {href}")

    # Save any remaining entries after finishing the loop
    if len(all_contents) % 20 != 0:
        json_file_name = os.path.join(output_dir, f"{len(all_contents) - len(all_contents) % 20 + 1}-{len(all_contents)}.json")
        with open(json_file_name, 'w', encoding='utf-8') as json_file:
            json.dump(all_contents[-(len(all_contents) % 20):], json_file, ensure_ascii=False, indent=4)
        print(f"Saved remaining entries to {json_file_name}")

finally:
    # Close the browser
    driver.quit()
