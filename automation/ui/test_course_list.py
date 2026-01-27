from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:5173"  # change if your dev URL is different

driver = webdriver.Chrome()
driver.maximize_window()
wait = WebDriverWait(driver, 15)

try:
    # 1) Open Course List page directly
    driver.get(BASE_URL + "/course-list")

    # 2) Open first course card
    first_course = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, 'a[href^="/course/"]'))
    )
    first_course.click()

    # 3) Assert course title is visible on details page
    title_el = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "h1")))
    print("Course title:", title_el.text)

finally:
    driver.quit()