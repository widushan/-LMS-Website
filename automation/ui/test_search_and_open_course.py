from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:5173"
SEARCH_TERM = "Generative AI"   # change to any keyword you expect to match a course title

driver = webdriver.Chrome()
driver.maximize_window()
wait = WebDriverWait(driver, 15)

try:
    # 1) Open course list page
    driver.get(BASE_URL + "/course-list")

    # 2) Type in the search input and submit (Search button)
    search_input = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, 'input[placeholder="Search for courses"]'))
    )
    search_input.clear()
    search_input.send_keys(SEARCH_TERM)

    search_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, '//button[normalize-space()="Search"]'))
    )
    search_btn.click()

    # 3) Verify URL changed to /course-list/<term>
    wait.until(EC.url_contains("/course-list/"))

    # 4) Click first course card result
    first_course = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, 'a[href^="/course/"]'))
    )
    first_course.click()

    # 5) Assert course details heading is visible
    title_el = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "h1")))
    print("Opened course title:", title_el.text)

finally:
    driver.quit()