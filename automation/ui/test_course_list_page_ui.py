from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:5173"  # adjust if needed

driver = webdriver.Chrome()
driver.maximize_window()
wait = WebDriverWait(driver, 15)

try:
    # 1) Open Course List page directly
    driver.get(BASE_URL + "/course-list")

    # 2) Verify heading "Course List" is visible
    heading = wait.until(
        EC.visibility_of_element_located((By.XPATH, '//h1[normalize-space()="Course List"]'))
    )
    print("Page heading text:", heading.text)

    # 3) Verify breadcrumb "Home / Course List" is present
    breadcrumb = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, '//p[contains(.,"Home") and contains(.,"Course List")]')
        )
    )
    print("Breadcrumb text:", breadcrumb.text)

    # 4) Count course cards (links to /course/<id>)
    course_cards = driver.find_elements(By.CSS_SELECTOR, 'a[href^="/course/"]')
    print("Number of course cards found:", len(course_cards))

    # Optional simple assertion
    if len(course_cards) == 0:
        print("WARNING: no courses visible on Course List page")

finally:
    driver.quit()