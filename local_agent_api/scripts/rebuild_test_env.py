from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    sys.path.insert(0, str(project_root.parent))

    from local_agent_api.services.test_env_service import rebuild_test_environment

    parser = argparse.ArgumentParser(description="Rebuild local test environment for Local Agent API.")
    parser.add_argument("--force-download", action="store_true", help="Redownload public test docs even if cached.")
    parser.add_argument("--skip-retrieval-eval", action="store_true", help="Skip retrieval eval after ingestion.")
    args = parser.parse_args()

    result = rebuild_test_environment(
        force_download=args.force_download,
        run_retrieval_eval=not args.skip_retrieval_eval,
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
