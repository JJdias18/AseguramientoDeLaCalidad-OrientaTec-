import {
  getQuestions,
  getCurrentAttempt,
  startAttempt,
  saveAnswer,
  submitAttempt,
  getProfile,
} from '../../services/questionnaireService';

jest.mock('../../services/apiClient', () => jest.fn());

const apiRequest = jest.requireMock('../../services/apiClient');

describe('questionnaireService (cliente)', () => {
  afterEach(() => jest.resetAllMocks());

  it('getQuestions pide GET /questions con el token', async () => {
    apiRequest.mockResolvedValue({ questions: [] });
    await getQuestions('jwt');
    expect(apiRequest).toHaveBeenCalledWith('/questions', { token: 'jwt' });
  });

  it('getCurrentAttempt pide GET /attempts/current', async () => {
    apiRequest.mockResolvedValue({ attempt: null });
    await getCurrentAttempt('jwt');
    expect(apiRequest).toHaveBeenCalledWith('/attempts/current', { token: 'jwt' });
  });

  it('startAttempt hace POST /attempts', async () => {
    apiRequest.mockResolvedValue({ attempt: { id: 1 } });
    await startAttempt('jwt');
    expect(apiRequest).toHaveBeenCalledWith('/attempts', { method: 'POST', token: 'jwt' });
  });

  it('saveAnswer hace PATCH /attempts/:id/answers con la respuesta', async () => {
    apiRequest.mockResolvedValue({ answer: {}, progress: {} });
    await saveAnswer('jwt', 7, 3, 5);
    expect(apiRequest).toHaveBeenCalledWith('/attempts/7/answers', {
      method: 'PATCH',
      token: 'jwt',
      body: { questionId: 3, value: 5 },
    });
  });

  it('submitAttempt hace POST /attempts/:id/submit', async () => {
    apiRequest.mockResolvedValue({ profile: {} });
    await submitAttempt('jwt', 7);
    expect(apiRequest).toHaveBeenCalledWith('/attempts/7/submit', { method: 'POST', token: 'jwt' });
  });

  it('getProfile pide GET /profile', async () => {
    apiRequest.mockResolvedValue({ profile: {} });
    await getProfile('jwt');
    expect(apiRequest).toHaveBeenCalledWith('/profile', { token: 'jwt' });
  });
});
