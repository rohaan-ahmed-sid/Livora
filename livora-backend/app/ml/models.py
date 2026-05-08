import torch
import torch.nn as nn


class HybridLSTMTransformer(nn.Module):
    """
    Glucose forecasting model.
    Input:  (batch, seq_len=36, 1)  — scaled CGM readings
    Output: (batch, 1)              — predicted glucose (scaled)
    """
    def __init__(self, input_size=1, hidden_size=32, d_model=32, nhead=2):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True)
        self.proj = nn.Linear(hidden_size, d_model)
        enc_layer = nn.TransformerEncoderLayer(
            d_model=d_model, nhead=nhead, batch_first=True, dropout=0.0
        )
        self.transformer = nn.TransformerEncoder(enc_layer, num_layers=1)
        self.fc = nn.Linear(d_model, 1)

    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        x = self.proj(lstm_out)
        x = self.transformer(x)
        x = x[:, -1, :]
        return self.fc(x)
