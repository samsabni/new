import re
import unittest
from pathlib import Path


ROOT = Path("/Users/sammie/Desktop/new")


class ShellSpecTests(unittest.TestCase):
    def test_shell_files_exist(self) -> None:
        self.assertTrue((ROOT / "index.html").exists(), "index.html should exist")
        self.assertTrue((ROOT / "styles.css").exists(), "styles.css should exist")

    def test_html_has_three_panel_shell(self) -> None:
        html = (ROOT / "index.html").read_text()

        self.assertIn('class="terminal-shell"', html)
        self.assertIn('class="panel panel-left"', html)
        self.assertIn('class="panel panel-center"', html)
        self.assertIn('class="panel panel-right"', html)
        self.assertIn('id="dev-panel-toggle"', html)
        self.assertIn('class="dev-panel-handle"', html)
        self.assertIn('id="dev-panel"', html)
        self.assertIn('class="dev-panel"', html)

    def test_css_matches_terminal_layout(self) -> None:
        css = (ROOT / "styles.css").read_text()

        self.assertRegex(css, r"grid-template-columns:\s*22fr\s+56fr\s+22fr;")
        self.assertIn("--color-background: #050505;", css)
        self.assertIn("--color-border: #202020;", css)
        self.assertIn("IBM Plex Mono", css)
        self.assertRegex(css, r"height:\s*100svh;")
        self.assertIn("--dev-panel-width:", css)
        self.assertRegex(css, r"\.dev-panel\s*\{[^}]*transform:\s*translateX\(100%\);", re.S)
        self.assertRegex(
            css,
            r"#dev-panel-toggle:checked\s*\+\s*\.dev-panel-handle\s*\+\s*\.dev-panel\s*\{[^}]*transform:\s*translateX\(0\);",
            re.S,
        )


if __name__ == "__main__":
    unittest.main()
