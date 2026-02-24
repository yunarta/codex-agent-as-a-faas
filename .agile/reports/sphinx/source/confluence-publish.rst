Publish To Confluence
======================

Environment
-----------

Set these variables or add them to `.env`:

- `CONFLUENCE_URL` (default: `https://galant.atlassian.net/wiki/`)
- `CONFLUENCE_USER`
- `CONFLUENCE_TOKEN`
- `CONFLUENCE_PARENT_PAGE` (optional, default: `Sprint Reports`)

Space config is fixed to:

- `confluence_space_name = CodexFAAS`
- `confluence_space_key = CODEXFAAS`

Install
-------

```bash
pip install sphinx sphinxcontrib-confluencebuilder myst-parser python-dotenv
```

Build and Publish
-----------------

```bash
cd docs/sphinx
sphinx-build -b confluence . _build/confluence
```

Dry Run
-------

Temporarily set `confluence_publish = False` inside `conf.py` to skip pushing.
