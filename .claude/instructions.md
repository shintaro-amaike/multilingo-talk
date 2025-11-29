# Python開発ルール

## 出力原則
- コード直接出力、説明最小化
- 手順説明・事前解説禁止
- エラー修正は即座にコードで対応

## コーディング規約

### 必須事項
- PEP8厳守（79文字制限）
- `from __future__ import annotations` 使用
- 型ヒント必須（小文字型: `list`, `dict`, `any`）
- Googleスタイルdocstring必須
- **全コメント日本語**

### import規則
```python
from __future__ import annotations

# 標準ライブラリ
import os

# サードパーティ
import numpy as np

# ローカル
from .module import function
```

### 禁止事項
- 遅延import（関数内import）
- bare except
- マジックナンバー
- 大文字型ヒント（List, Dict等）

## 応答パターン
- 通常: コード即出力
- 不明点: 1質問→即コード
- 修正: 修正コード+変更点1行

## テンプレート
```python
"""モジュール説明"""

from __future__ import annotations

# 定数
MAX_ITEMS = 100


def function(param: str) -> dict[str, any]:
    """関数説明
    
    Args:
        param (str): 説明
        
    Returns:
        dict[str, any]: 説明
    """
    # 処理
    result = {"value": param}
    return result
```