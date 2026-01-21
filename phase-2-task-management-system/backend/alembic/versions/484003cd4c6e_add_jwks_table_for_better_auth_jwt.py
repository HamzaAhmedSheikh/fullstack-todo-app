"""add jwks table for better auth jwt

Revision ID: 484003cd4c6e
Revises: 3a5246961ac1
Create Date: 2026-01-09 05:00:44.812538

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '484003cd4c6e'
down_revision: Union[str, Sequence[str], None] = '3a5246961ac1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - Create jwks table for Better Auth JWT."""
    # Create jwks table for JWT key storage
    op.create_table(
        'jwks',
        sa.Column('id', sa.Text(), nullable=False),
        sa.Column('public_key', sa.Text(), nullable=False),
        sa.Column('private_key', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_jwks_id', 'jwks', ['id'])


def downgrade() -> None:
    """Downgrade schema - Drop jwks table."""
    op.drop_table('jwks')
