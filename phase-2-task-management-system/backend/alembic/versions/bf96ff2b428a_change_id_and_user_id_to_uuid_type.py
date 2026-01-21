"""Change id and user_id to UUID type

Revision ID: bf96ff2b428a
Revises: 4a73b7189d1b
Create Date: 2026-01-08 10:29:08.450251

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bf96ff2b428a'
down_revision: Union[str, Sequence[str], None] = '4a73b7189d1b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Enable uuid-ossp extension
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    # Change id column from VARCHAR(36) to UUID
    op.execute('ALTER TABLE tasks ALTER COLUMN id TYPE UUID USING id::uuid')

    # Change user_id column from VARCHAR(36) to UUID
    op.execute('ALTER TABLE tasks ALTER COLUMN user_id TYPE UUID USING user_id::uuid')


def downgrade() -> None:
    """Downgrade schema."""
    # Change id column back to VARCHAR(36)
    op.execute('ALTER TABLE tasks ALTER COLUMN id TYPE VARCHAR(36) USING id::text')

    # Change user_id column back to VARCHAR(36)
    op.execute('ALTER TABLE tasks ALTER COLUMN user_id TYPE VARCHAR(36) USING user_id::text')
