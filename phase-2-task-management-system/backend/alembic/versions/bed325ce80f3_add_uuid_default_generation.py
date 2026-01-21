"""add uuid default generation

Revision ID: bed325ce80f3
Revises: 484003cd4c6e
Create Date: 2026-01-09 05:29:12.300220

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bed325ce80f3'
down_revision: Union[str, Sequence[str], None] = '484003cd4c6e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - Add UUID default generation to id columns."""
    # Enable pgcrypto extension for gen_random_uuid()
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')

    # Add default UUID generation to users table
    op.execute('ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid()')

    # Add default UUID generation to sessions table
    op.execute('ALTER TABLE sessions ALTER COLUMN id SET DEFAULT gen_random_uuid()')

    # Add default UUID generation to accounts table
    op.execute('ALTER TABLE accounts ALTER COLUMN id SET DEFAULT gen_random_uuid()')

    # Add default UUID generation to verifications table
    op.execute('ALTER TABLE verifications ALTER COLUMN id SET DEFAULT gen_random_uuid()')


def downgrade() -> None:
    """Downgrade schema - Remove UUID default generation."""
    op.execute('ALTER TABLE users ALTER COLUMN id DROP DEFAULT')
    op.execute('ALTER TABLE sessions ALTER COLUMN id DROP DEFAULT')
    op.execute('ALTER TABLE accounts ALTER COLUMN id DROP DEFAULT')
    op.execute('ALTER TABLE verifications ALTER COLUMN id DROP DEFAULT')
