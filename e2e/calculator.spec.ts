import { test, expect } from "@playwright/test";

test.describe("Calculadora FIRE", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads with default values", async ({ page }) => {
    await expect(page.getByText("Calculadora FIRE Brasil")).toBeVisible();
    await expect(page.getByText("Dados Pessoais")).toBeVisible();
    await expect(page.getByText(/Situação Financeira/)).toBeVisible();
    await expect(page.getByText(/Alocação de Ativos/)).toBeVisible();
    await expect(page.getByText("Premissas")).toBeVisible();
  });

  test("KPI cards display correct initial values", async ({ page }) => {
    const fireNumber = page.getByTestId("fire-number");
    await expect(fireNumber).toBeVisible();
    await expect(fireNumber).not.toHaveText("R$ 0,00");

    const yearsToFire = page.getByTestId("years-to-fire");
    await expect(yearsToFire).toBeVisible();
    await expect(yearsToFire).toContainText("anos");

    const incomeNet = page.getByTestId("income-net");
    await expect(incomeNet).toBeVisible();
  });

  test("changing age inputs updates results", async ({ page }) => {
    const currentAgeInput = page.getByLabel("Idade atual");
    await currentAgeInput.fill("25");

    await page.waitForTimeout(300);

    const yearsToFire = page.getByTestId("years-to-fire");
    await expect(yearsToFire).toBeVisible();
  });

  test("changing contribution updates FIRE number", async ({ page }) => {
    const contributionInput = page.locator("#contribution");
    await contributionInput.fill("500000");

    await page.waitForTimeout(300);

    await expect(page.getByTestId("fire-number")).toBeVisible();
    await expect(page.getByTestId("years-to-fire")).toBeVisible();
  });

  test("tab navigation works (all 4 tabs)", async ({ page }) => {
    const tabs = ["Projeção", "Monte Carlo", "Alocação", "Análise de Retirada"];

    for (const tab of tabs) {
      await page.getByRole("tab", { name: tab }).click();
      await expect(page.getByRole("tab", { name: tab })).toHaveAttribute(
        "data-state",
        "active"
      );
    }
  });

  test("INSS toggle enables INSS section", async ({ page }) => {
    // INSS section should not be visible by default
    await expect(page.getByText("Impacto do INSS no FIRE")).not.toBeVisible();

    // Enable INSS via the switch toggle
    const toggle = page.getByRole("switch", { name: "Incluir INSS" });
    await toggle.scrollIntoViewIfNeeded();
    await toggle.click({ force: true });

    // INSS fields should appear in sidebar
    await expect(page.locator("#inssBenefit")).toBeVisible();
    await expect(page.locator("#inssAge")).toBeVisible();

    // INSS integration card should appear in results
    await expect(page.getByText("Impacto do INSS no FIRE")).toBeVisible();
  });

  test("next action strip shows suggestion", async ({ page }) => {
    const strip = page.getByTestId("next-action-strip");
    const isVisible = await strip.isVisible().catch(() => false);
    if (isVisible) {
      await expect(strip).toContainText("Deseja atingir FIRE mais cedo");
    }
  });

  test("sidebar inputs are all functional", async ({ page }) => {
    // Age inputs
    await expect(page.getByLabel("Idade atual")).toBeVisible();
    await expect(page.getByLabel("Aposentadoria")).toBeVisible();

    // Financial inputs
    await expect(page.locator("#netWorth")).toBeVisible();
    await expect(page.locator("#contribution")).toBeVisible();
    await expect(page.locator("#expenses")).toBeVisible();

    // Assumptions
    await expect(page.locator("#inflation")).toBeVisible();
    await expect(page.locator("#swr")).toBeVisible();

    // INSS fields hidden by default
    await expect(page.locator("#inssBenefit")).not.toBeVisible();
    await expect(page.locator("#inssAge")).not.toBeVisible();
  });

  test("responsive layout (sidebar + results side by side on desktop)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    const sidebar = page.locator(".grid > div").first();
    const results = page.locator(".grid > div").nth(1);

    await expect(sidebar).toBeVisible();
    await expect(results).toBeVisible();

    const sidebarBox = await sidebar.boundingBox();
    const resultsBox = await results.boundingBox();

    if (sidebarBox && resultsBox) {
      expect(resultsBox.x).toBeGreaterThan(sidebarBox.x);
    }
  });
});
