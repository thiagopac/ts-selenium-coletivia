import { Builder, By, until, WebDriver } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";

describe("Login Tests", () => {
  let driver: WebDriver;

  beforeAll(async () => {
    const options = new chrome.Options();
    options.addArguments("--headless");
    options.addArguments("--disable-gpu");
    options.addArguments("--no-sandbox");

    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  const logout = async () => {
    const userMenu = await driver.wait(
      until.elementLocated(By.css(".header-username")),
      10000
    );
    await userMenu.click();

    const logoutButton = await driver.wait(
      until.elementLocated(By.xpath("//a[contains(text(), 'Sair')]")),
      10000
    );
    await logoutButton.click();

    await driver.wait(until.urlIs("http://localhost:4200/auth/login"), 10000);
  };

  it("should login successfully and logout", async () => {
    await driver.get("http://localhost:4200/auth/login");

    const emailInput = await driver.wait(
      until.elementLocated(By.name("email")),
      10000
    );
    await emailInput.sendKeys("john@doe.com");

    const passwordInput = await driver.findElement(By.name("password"));
    await passwordInput.sendKeys("password");

    const submitButton = await driver.findElement(
      By.css("button[type='submit']")
    );
    await submitButton.click();

    await driver.wait(until.urlIs("http://localhost:4200/start"), 10000);
    expect(await driver.getCurrentUrl()).toBe("http://localhost:4200/start");

    await logout();
  });

  it("should show error on invalid login", async () => {
    await driver.get("http://localhost:4200/auth/login");

    const emailInput = await driver.wait(
      until.elementLocated(By.name("email")),
      10000
    );
    await emailInput.sendKeys("wrong@example.com");

    const passwordInput = await driver.findElement(By.name("password"));
    await passwordInput.sendKeys("wrongpassword");

    const submitButton = await driver.findElement(
      By.css("button[type='submit']")
    );
    await submitButton.click();

    const errorElement = await driver.wait(
      until.elementLocated(By.css(".alert-text")),
      10000
    );
    const errorMessage = await errorElement.getText();

    expect(errorMessage).toBe(
      "Você não possui uma conta cadastrada com o e-mail informado. Crie uma conta clicando acima em Cadastre-se agora"
    );
  });

  it("should redirect to Google login on clicking 'Entrar com conta Google'", async () => {
    await driver.get("http://localhost:4200/auth/login");

    const googleLoginButton = await driver.wait(
      until.elementLocated(
        By.xpath("//a[contains(text(),'Entrar com conta Google')]")
      ),
      10000
    );
    await googleLoginButton.click();

    await driver.wait(until.urlContains("https://accounts.google.com/"), 10000);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain("https://accounts.google.com/");
  });

  it("should navigate to forgot password page", async () => {
    await driver.get("http://localhost:4200/auth/login");

    const forgotPasswordLink = await driver.wait(
      until.elementLocated(By.linkText("Esqueceu a senha ?")),
      10000
    );
    await forgotPasswordLink.click();

    await driver.wait(
      until.urlIs("http://localhost:4200/auth/forgot-password"),
      10000
    );
    expect(await driver.getCurrentUrl()).toBe(
      "http://localhost:4200/auth/forgot-password"
    );
  });

  it("should navigate to registration page", async () => {
    await driver.get("http://localhost:4200/auth/login");

    const registerLink = await driver.wait(
      until.elementLocated(By.linkText("Cadastre-se agora!")),
      10000
    );
    await registerLink.click();

    await driver.wait(
      until.urlIs("http://localhost:4200/auth/registration"),
      10000
    );
    expect(await driver.getCurrentUrl()).toBe(
      "http://localhost:4200/auth/registration"
    );
  });
});
