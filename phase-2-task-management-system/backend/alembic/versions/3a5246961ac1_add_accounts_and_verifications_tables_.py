"""add accounts and verifications tables for better auth

Revision ID: 3a5246961ac1
Revises: c35ee255b6ed
Create Date: 2026-01-09 04:51:06.043331

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3a5246961ac1'
down_revision: Union[str, Sequence[str], None] = 'c35ee255b6ed'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - Create accounts and verifications tables for Better Auth."""
    # Create accounts table (for OAuth providers and email/password)
    op.create_table(
        'accounts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('account_id', sa.String(), nullable=False),
        sa.Column('provider_id', sa.String(), nullable=False),
        sa.Column('access_token', sa.Text(), nullable=True),
        sa.Column('refresh_token', sa.Text(), nullable=True),
        sa.Column('id_token', sa.Text(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('password', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_accounts_id', 'accounts', ['id'])
    op.create_index('ix_accounts_user_id', 'accounts', ['user_id'])

    # Create verifications table (for email verification tokens)
    op.create_table(
        'verifications',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('identifier', sa.String(), nullable=False),
        sa.Column('value', sa.String(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_verifications_id', 'verifications', ['id'])


def downgrade() -> None:
    """Downgrade schema - Drop accounts and verifications tables."""
    op.drop_table('verifications')
    op.drop_table('accounts')
